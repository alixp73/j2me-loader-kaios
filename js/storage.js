/**
 * J2ME Loader for KaiOS
 * Storage functionality using KaiOS deviceStorage API
 */

// Storage state
const storageState = {
  defaultStorage: null,
  allStorages: [],
  appDirectory: 'j2me-loader/',
  appsDirectory: 'j2me-loader/apps/',
  configDirectory: 'j2me-loader/config/',
  tempDirectory: 'j2me-loader/temp/'
};

/**
 * Initialize the storage system
 * @returns {Promise} Resolves when storage is initialized
 */
function initStorage() {
  return new Promise((resolve, reject) => {
    console.log('Initializing storage system');
    
    // Check if deviceStorage API is available
    if (!navigator.getDeviceStorage) {
      console.error('DeviceStorage API not available');
      reject(new Error('DeviceStorage API not available'));
      return;
    }
    
    try {
      // Get the default storage (sdcard)
      storageState.defaultStorage = navigator.getDeviceStorage('sdcard');
      
      // Get all available storages
      storageState.allStorages = navigator.getDeviceStorages('sdcard');
      
      console.log(`Found ${storageState.allStorages.length} storage(s)`);
      
      // Create necessary directories
      createDirectoryStructure()
        .then(() => {
          console.log('Storage system initialized');
          resolve();
        })
        .catch(error => {
          console.error('Failed to create directory structure', error);
          reject(error);
        });
    } catch (error) {
      console.error('Error initializing storage', error);
      reject(error);
    }
  });
}

/**
 * Create the necessary directory structure
 * @returns {Promise} Resolves when directories are created
 */
function createDirectoryStructure() {
  return Promise.all([
    createDirectory(storageState.appDirectory),
    createDirectory(storageState.appsDirectory),
    createDirectory(storageState.configDirectory),
    createDirectory(storageState.tempDirectory)
  ]);
}

/**
 * Create a directory if it doesn't exist
 * @param {string} path - Directory path
 * @returns {Promise} Resolves when directory is created or already exists
 */
function createDirectory(path) {
  return new Promise((resolve, reject) => {
    // Check if directory exists by trying to enumerate files
    const cursor = storageState.defaultStorage.enumerate(path);
    
    cursor.onsuccess = function() {
      // Directory exists
      resolve();
    };
    
    cursor.onerror = function() {
      // Directory doesn't exist, create it by adding a placeholder file
      // (KaiOS doesn't have a direct way to create directories)
      const placeholderFile = new Blob([''], { type: 'text/plain' });
      const request = storageState.defaultStorage.addNamed(placeholderFile, `${path}.placeholder`);
      
      request.onsuccess = function() {
        console.log(`Created directory: ${path}`);
        resolve();
      };
      
      request.onerror = function() {
        console.error(`Failed to create directory: ${path}`, this.error);
        reject(this.error);
      };
    };
  });
}

/**
 * Save a JAR file to storage
 * @param {Blob} jarBlob - The JAR file as a Blob
 * @param {string} filename - Name to save the file as
 * @returns {Promise<string>} Resolves with the path to the saved file
 */
function saveJarFile(jarBlob, filename) {
  return new Promise((resolve, reject) => {
    // Ensure filename has .jar extension
    if (!filename.toLowerCase().endsWith('.jar')) {
      filename += '.jar';
    }
    
    // Create a safe filename (remove special characters)
    const safeFilename = filename.replace(/[^a-zA-Z0-9_.-]/g, '_');
    const filePath = `${storageState.appsDirectory}${safeFilename}`;
    
    // Save the JAR file
    const request = storageState.defaultStorage.addNamed(jarBlob, filePath);
    
    request.onsuccess = function() {
      console.log(`Saved JAR file: ${filePath}`);
      resolve(filePath);
    };
    
    request.onerror = function() {
      console.error(`Failed to save JAR file: ${filePath}`, this.error);
      reject(this.error);
    };
  });
}

/**
 * Get a file from storage
 * @param {string} path - Path to the file
 * @returns {Promise<File>} Resolves with the File object
 */
function getFile(path) {
  return new Promise((resolve, reject) => {
    const request = storageState.defaultStorage.get(path);
    
    request.onsuccess = function() {
      resolve(this.result);
    };
    
    request.onerror = function() {
      console.error(`Failed to get file: ${path}`, this.error);
      reject(this.error);
    };
  });
}

/**
 * Delete a file from storage
 * @param {string} path - Path to the file
 * @returns {Promise} Resolves when the file is deleted
 */
function deleteFile(path) {
  return new Promise((resolve, reject) => {
    const request = storageState.defaultStorage.delete(path);
    
    request.onsuccess = function() {
      console.log(`Deleted file: ${path}`);
      resolve();
    };
    
    request.onerror = function() {
      console.error(`Failed to delete file: ${path}`, this.error);
      reject(this.error);
    };
  });
}

/**
 * List files in a directory
 * @param {string} directory - Directory path
 * @returns {Promise<Array>} Resolves with an array of file objects
 */
function listFiles(directory) {
  return new Promise((resolve, reject) => {
    const files = [];
    const cursor = storageState.defaultStorage.enumerate(directory);
    
    cursor.onsuccess = function() {
      if (this.result) {
        // Add file to the list
        const file = this.result;
        
        // Skip placeholder files
        if (!file.name.endsWith('.placeholder')) {
          files.push({
            name: file.name.split('/').pop(), // Get just the filename
            path: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModifiedDate
          });
        }
        
        // Continue to the next file
        this.continue();
      } else {
        // No more files, return the list
        resolve(files);
      }
    };
    
    cursor.onerror = function() {
      console.error(`Failed to list files in: ${directory}`, this.error);
      reject(this.error);
    };
  });
}

/**
 * Get available storage space
 * @returns {Promise<Object>} Resolves with free and used space in bytes
 */
function getStorageSpace() {
  return new Promise((resolve, reject) => {
    const freeRequest = storageState.defaultStorage.freeSpace();
    
    freeRequest.onsuccess = function() {
      const freeSpace = this.result;
      
      const usedRequest = storageState.defaultStorage.usedSpace();
      
      usedRequest.onsuccess = function() {
        const usedSpace = this.result;
        
        resolve({
          free: freeSpace,
          used: usedSpace,
          total: freeSpace + usedSpace
        });
      };
      
      usedRequest.onerror = function() {
        console.error('Failed to get used space', this.error);
        reject(this.error);
      };
    };
    
    freeRequest.onerror = function() {
      console.error('Failed to get free space', this.error);
      reject(this.error);
    };
  });
}

/**
 * Save application settings
 * @param {string} appId - Application ID
 * @param {Object} settings - Settings object
 * @returns {Promise} Resolves when settings are saved
 */
function saveAppSettings(appId, settings) {
  return new Promise((resolve, reject) => {
    const settingsBlob = new Blob([JSON.stringify(settings)], { type: 'application/json' });
    const filePath = `${storageState.configDirectory}${appId}.json`;
    
    // Delete existing settings file if it exists
    deleteFile(filePath)
      .catch(() => {
        // Ignore errors if file doesn't exist
      })
      .finally(() => {
        // Save new settings file
        const request = storageState.defaultStorage.addNamed(settingsBlob, filePath);
        
        request.onsuccess = function() {
          console.log(`Saved settings for app: ${appId}`);
          resolve();
        };
        
        request.onerror = function() {
          console.error(`Failed to save settings for app: ${appId}`, this.error);
          reject(this.error);
        };
      });
  });
}

/**
 * Load application settings
 * @param {string} appId - Application ID
 * @returns {Promise<Object>} Resolves with the settings object
 */
function loadAppSettings(appId) {
  return new Promise((resolve, reject) => {
    const filePath = `${storageState.configDirectory}${appId}.json`;
    
    getFile(filePath)
      .then(file => {
        const reader = new FileReader();
        
        reader.onload = function() {
          try {
            const settings = JSON.parse(reader.result);
            resolve(settings);
          } catch (error) {
            console.error(`Failed to parse settings for app: ${appId}`, error);
            reject(error);
          }
        };
        
        reader.onerror = function() {
          console.error(`Failed to read settings for app: ${appId}`, reader.error);
          reject(reader.error);
        };
        
        reader.readAsText(file);
      })
      .catch(error => {
        // If settings file doesn't exist, return default settings
        console.log(`No settings found for app: ${appId}, using defaults`);
        resolve(getDefaultSettings());
      });
  });
}

/**
 * Get default application settings
 * @returns {Object} Default settings object
 */
function getDefaultSettings() {
  return {
    screenSize: 'original',
    orientation: 'auto',
    fontSize: 'medium',
    soundEnabled: true,
    keyMapping: getDefaultKeyMapping()
  };
}

/**
 * Get default key mapping
 * @returns {Object} Default key mapping
 */
function getDefaultKeyMapping() {
  return {
    'ArrowUp': 'UP',
    'ArrowDown': 'DOWN',
    'ArrowLeft': 'LEFT',
    'ArrowRight': 'RIGHT',
    'Enter': 'SELECT',
    '1': '1',
    '2': '2',
    '3': '3',
    '4': '4',
    '5': '5',
    '6': '6',
    '7': '7',
    '8': '8',
    '9': '9',
    '*': 'STAR',
    '0': '0',
    '#': 'POUND'
  };
}

/**
 * Extract JAR file metadata
 * @param {File} jarFile - JAR file
 * @returns {Promise<Object>} Resolves with metadata object
 */
function extractJarMetadata(jarFile) {
  return new Promise((resolve, reject) => {
    // In a real implementation, this would extract the JAR manifest
    // and read metadata like MIDlet-Name, MIDlet-Version, etc.
    // For now, we'll just use the filename and size
    
    const filename = jarFile.name.split('/').pop();
    const appName = filename.replace(/\.jar$/i, '');
    
    const metadata = {
      id: generateAppId(appName),
      name: appName,
      path: jarFile.name,
      size: formatFileSize(jarFile.size),
      vendor: 'Unknown',
      version: '1.0',
      icon: null
    };
    
    resolve(metadata);
  });
}

/**
 * Generate a unique app ID
 * @param {string} appName - Application name
 * @returns {string} Unique app ID
 */
function generateAppId(appName) {
  return 'app_' + appName.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now();
}

/**
 * Format file size in human-readable format
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size
 */
function formatFileSize(bytes) {
  if (bytes < 1024) {
    return bytes + ' B';
  } else if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(1) + ' KB';
  } else {
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
}

// Export functions for use in other modules
window.Storage = {
  init: initStorage,
  saveJarFile: saveJarFile,
  getFile: getFile,
  deleteFile: deleteFile,
  listFiles: listFiles,
  getStorageSpace: getStorageSpace,
  saveAppSettings: saveAppSettings,
  loadAppSettings: loadAppSettings,
  extractJarMetadata: extractJarMetadata
};
