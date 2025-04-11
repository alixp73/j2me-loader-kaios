/**
 * J2ME Loader for KaiOS
 * Database functionality using IndexedDB
 */

// Database state
const dbState = {
  db: null,
  DB_NAME: 'j2meLoaderDB',
  DB_VERSION: 1,
  APPS_STORE: 'apps',
  SETTINGS_STORE: 'settings'
};

/**
 * Initialize the database
 * @returns {Promise} Resolves when database is initialized
 */
function initDatabase() {
  return new Promise((resolve, reject) => {
    console.log('Initializing database');
    
    if (!window.indexedDB) {
      console.error('IndexedDB not supported');
      reject(new Error('IndexedDB not supported'));
      return;
    }
    
    const request = indexedDB.open(dbState.DB_NAME, dbState.DB_VERSION);
    
    request.onerror = function(event) {
      console.error('Database error:', event.target.error);
      reject(event.target.error);
    };
    
    request.onsuccess = function(event) {
      dbState.db = event.target.result;
      console.log('Database initialized successfully');
      resolve();
    };
    
    request.onupgradeneeded = function(event) {
      const db = event.target.result;
      
      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains(dbState.APPS_STORE)) {
        const appsStore = db.createObjectStore(dbState.APPS_STORE, { keyPath: 'id' });
        appsStore.createIndex('name', 'name', { unique: false });
        appsStore.createIndex('path', 'path', { unique: true });
        console.log('Created apps store');
      }
      
      if (!db.objectStoreNames.contains(dbState.SETTINGS_STORE)) {
        const settingsStore = db.createObjectStore(dbState.SETTINGS_STORE, { keyPath: 'id' });
        console.log('Created settings store');
      }
    };
  });
}

/**
 * Save application metadata to database
 * @param {Object} appData - Application metadata
 * @returns {Promise} Resolves when data is saved
 */
function saveAppData(appData) {
  return new Promise((resolve, reject) => {
    if (!dbState.db) {
      reject(new Error('Database not initialized'));
      return;
    }
    
    const transaction = dbState.db.transaction([dbState.APPS_STORE], 'readwrite');
    const store = transaction.objectStore(dbState.APPS_STORE);
    
    // Add timestamp
    appData.timestamp = Date.now();
    
    const request = store.put(appData);
    
    request.onsuccess = function() {
      console.log(`Saved app data for: ${appData.name}`);
      resolve();
    };
    
    request.onerror = function(event) {
      console.error(`Failed to save app data for: ${appData.name}`, event.target.error);
      reject(event.target.error);
    };
  });
}

/**
 * Get application metadata from database
 * @param {string} appId - Application ID
 * @returns {Promise<Object>} Resolves with app data
 */
function getAppData(appId) {
  return new Promise((resolve, reject) => {
    if (!dbState.db) {
      reject(new Error('Database not initialized'));
      return;
    }
    
    const transaction = dbState.db.transaction([dbState.APPS_STORE], 'readonly');
    const store = transaction.objectStore(dbState.APPS_STORE);
    const request = store.get(appId);
    
    request.onsuccess = function() {
      if (request.result) {
        resolve(request.result);
      } else {
        reject(new Error(`App not found: ${appId}`));
      }
    };
    
    request.onerror = function(event) {
      console.error(`Failed to get app data for: ${appId}`, event.target.error);
      reject(event.target.error);
    };
  });
}

/**
 * Delete application metadata from database
 * @param {string} appId - Application ID
 * @returns {Promise} Resolves when data is deleted
 */
function deleteAppData(appId) {
  return new Promise((resolve, reject) => {
    if (!dbState.db) {
      reject(new Error('Database not initialized'));
      return;
    }
    
    const transaction = dbState.db.transaction([dbState.APPS_STORE], 'readwrite');
    const store = transaction.objectStore(dbState.APPS_STORE);
    const request = store.delete(appId);
    
    request.onsuccess = function() {
      console.log(`Deleted app data for ID: ${appId}`);
      resolve();
    };
    
    request.onerror = function(event) {
      console.error(`Failed to delete app data for: ${appId}`, event.target.error);
      reject(event.target.error);
    };
  });
}

/**
 * Get all applications from database
 * @returns {Promise<Array>} Resolves with array of app data
 */
function getAllApps() {
  return new Promise((resolve, reject) => {
    if (!dbState.db) {
      reject(new Error('Database not initialized'));
      return;
    }
    
    const apps = [];
    const transaction = dbState.db.transaction([dbState.APPS_STORE], 'readonly');
    const store = transaction.objectStore(dbState.APPS_STORE);
    const request = store.openCursor();
    
    request.onsuccess = function(event) {
      const cursor = event.target.result;
      if (cursor) {
        apps.push(cursor.value);
        cursor.continue();
      } else {
        // Sort apps by name
        apps.sort((a, b) => a.name.localeCompare(b.name));
        resolve(apps);
      }
    };
    
    request.onerror = function(event) {
      console.error('Failed to get all apps', event.target.error);
      reject(event.target.error);
    };
  });
}

/**
 * Save global settings to database
 * @param {Object} settings - Settings object
 * @returns {Promise} Resolves when settings are saved
 */
function saveGlobalSettings(settings) {
  return new Promise((resolve, reject) => {
    if (!dbState.db) {
      reject(new Error('Database not initialized'));
      return;
    }
    
    const transaction = dbState.db.transaction([dbState.SETTINGS_STORE], 'readwrite');
    const store = transaction.objectStore(dbState.SETTINGS_STORE);
    
    // Use 'global' as the ID for global settings
    const settingsData = {
      id: 'global',
      ...settings,
      timestamp: Date.now()
    };
    
    const request = store.put(settingsData);
    
    request.onsuccess = function() {
      console.log('Saved global settings');
      resolve();
    };
    
    request.onerror = function(event) {
      console.error('Failed to save global settings', event.target.error);
      reject(event.target.error);
    };
  });
}

/**
 * Get global settings from database
 * @returns {Promise<Object>} Resolves with settings object
 */
function getGlobalSettings() {
  return new Promise((resolve, reject) => {
    if (!dbState.db) {
      reject(new Error('Database not initialized'));
      return;
    }
    
    const transaction = dbState.db.transaction([dbState.SETTINGS_STORE], 'readonly');
    const store = transaction.objectStore(dbState.SETTINGS_STORE);
    const request = store.get('global');
    
    request.onsuccess = function() {
      if (request.result) {
        resolve(request.result);
      } else {
        // Return default settings if none found
        resolve(getDefaultGlobalSettings());
      }
    };
    
    request.onerror = function(event) {
      console.error('Failed to get global settings', event.target.error);
      reject(event.target.error);
    };
  });
}

/**
 * Get default global settings
 * @returns {Object} Default settings
 */
function getDefaultGlobalSettings() {
  return {
    id: 'global',
    theme: 'light',
    language: 'en',
    defaultStoragePath: '/sdcard/',
    showHiddenFiles: false,
    autoStartLastApp: false,
    timestamp: Date.now()
  };
}

// Export functions for use in other modules
window.Database = {
  init: initDatabase,
  saveAppData: saveAppData,
  getAppData: getAppData,
  deleteAppData: deleteAppData,
  getAllApps: getAllApps,
  saveGlobalSettings: saveGlobalSettings,
  getGlobalSettings: getGlobalSettings
};
