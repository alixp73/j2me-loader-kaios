/**
 * J2ME Loader for KaiOS
 * Main application logic
 */

// App state
const appState = {
  currentScreen: 'app-list',
  appList: [],
  selectedApp: null,
  selectedAppIndex: -1,
  currentPath: '/sdcard/',
  isInitialized: false,
  isLoading: false
};

// DOM Elements
const screens = {
  appList: document.getElementById('app-list'),
  appDetails: document.getElementById('app-details'),
  appSettings: document.getElementById('app-settings'),
  emulatorScreen: document.getElementById('emulator-screen'),
  fileBrowser: document.getElementById('file-browser')
};

const elements = {
  appsList: document.getElementById('apps'),
  appName: document.getElementById('app-name'),
  appInfo: document.getElementById('app-info'),
  appIcon: document.getElementById('app-icon'),
  runAppBtn: document.getElementById('run-app'),
  settingsAppBtn: document.getElementById('settings-app'),
  deleteAppBtn: document.getElementById('delete-app'),
  softkeyLeft: document.getElementById('softkey-left'),
  softkeyCenter: document.getElementById('softkey-center'),
  softkeyRight: document.getElementById('softkey-right'),
  emulatorCanvas: document.getElementById('emulator-canvas'),
  loadingIndicator: document.getElementById('loading-indicator')
};

// Initialize the application
function initApp() {
  console.log('Initializing J2ME Loader for KaiOS');
  
  showLoading('Initializing...');
  
  // Set up event listeners
  document.addEventListener('keydown', handleKeyDown);
  
  // Button event listeners
  elements.runAppBtn.addEventListener('click', runSelectedApp);
  elements.settingsAppBtn.addEventListener('click', openAppSettings);
  elements.deleteAppBtn.addEventListener('click', confirmDeleteApp);
  
  // Initialize components
  Promise.all([
    Storage.init(),
    Database.init(),
    EmulatorCore.init(elements.emulatorCanvas)
  ])
  .then(() => {
    appState.isInitialized = true;
    console.log('All components initialized');
    
    // Load installed apps
    return loadInstalledApps();
  })
  .then(() => {
    // Update softkeys for initial screen
    updateSoftkeys();
    hideLoading();
  })
  .catch(error => {
    console.error('Initialization error:', error);
    alert(`Failed to initialize: ${error.message}`);
    hideLoading();
  });
}

// Show loading indicator
function showLoading(message) {
  appState.isLoading = true;
  if (elements.loadingIndicator) {
    elements.loadingIndicator.textContent = message || 'Loading...';
    elements.loadingIndicator.classList.add('active');
  }
}

// Hide loading indicator
function hideLoading() {
  appState.isLoading = false;
  if (elements.loadingIndicator) {
    elements.loadingIndicator.classList.remove('active');
  }
}

// Load the list of installed J2ME applications
function loadInstalledApps() {
  console.log('Loading installed apps');
  showLoading('Loading apps...');
  
  return Database.getAllApps()
    .then(apps => {
      appState.appList = apps;
      console.log(`Loaded ${apps.length} apps`);
      
      // Reset selection
      appState.selectedApp = null;
      appState.selectedAppIndex = apps.length > 0 ? 0 : -1;
      
      // Select first app if available
      if (apps.length > 0) {
        selectApp(0);
      }
      
      renderAppList();
      hideLoading();
    })
    .catch(error => {
      console.error('Failed to load apps', error);
      appState.appList = [];
      renderAppList();
      hideLoading();
    });
}

// Render the list of applications
function renderAppList() {
  if (appState.appList.length === 0) {
    elements.appsList.innerHTML = '<li class="no-apps">No applications found</li>';
    return;
  }
  
  elements.appsList.innerHTML = '';
  appState.appList.forEach((app, index) => {
    const li = document.createElement('li');
    li.textContent = app.name;
    li.dataset.appId = app.id;
    li.dataset.index = index;
    
    if (index === appState.selectedAppIndex) {
      li.classList.add('focused');
    }
    
    li.addEventListener('click', () => {
      selectApp(index);
    });
    
    elements.appsList.appendChild(li);
  });
}

// Select an application from the list
function selectApp(index) {
  if (index < 0 || index >= appState.appList.length) return;
  
  appState.selectedAppIndex = index;
  appState.selectedApp = appState.appList[index];
  
  // Update UI to show selection
  const items = elements.appsList.querySelectorAll('li');
  items.forEach(item => item.classList.remove('focused'));
  
  if (items[index]) {
    items[index].classList.add('focused');
    
    // Scroll to make the selected item visible if needed
    items[index].scrollIntoView({ block: 'nearest' });
  }
}

// Open the details screen for the selected app
function openAppDetails() {
  if (!appState.selectedApp) return;
  
  elements.appName.textContent = appState.selectedApp.name;
  elements.appInfo.textContent = `Size: ${appState.selectedApp.size} | Vendor: ${appState.selectedApp.vendor || 'Unknown'}`;
  
  // Set app icon if available
  if (appState.selectedApp.icon) {
    elements.appIcon.style.backgroundImage = `url(${appState.selectedApp.icon})`;
  } else {
    elements.appIcon.style.backgroundImage = 'none';
    elements.appIcon.style.backgroundColor = '#0061e0';
    
    // Set initials as icon
    const initials = document.createElement('span');
    initials.textContent = appState.selectedApp.name.charAt(0).toUpperCase();
    initials.className = 'app-initials';
    
    // Clear previous content
    elements.appIcon.innerHTML = '';
    elements.appIcon.appendChild(initials);
  }
  
  navigateToScreen('app-details');
}

// Run the selected application
function runSelectedApp() {
  if (!appState.selectedApp) return;
  console.log(`Running application: ${appState.selectedApp.name}`);
  
  showLoading('Loading application...');
  
  // Get the JAR file
  Storage.getFile(appState.selectedApp.path)
    .then(jarFile => {
      // Load the JAR file into the emulator
      return EmulatorCore.loadJar(jarFile);
    })
    .then(midletInfo => {
      console.log('JAR loaded successfully:', midletInfo);
      
      // Load app settings
      return Storage.loadAppSettings(appState.selectedApp.id)
        .then(settings => {
          // Navigate to the emulator screen
          navigateToScreen('emulator-screen');
          
          // Start the emulator with the loaded JAR and settings
          return EmulatorCore.start({
            screenSize: settings.screenSize,
            orientation: settings.orientation,
            keyMapping: settings.keyMapping,
            soundEnabled: settings.soundEnabled
          });
        });
    })
    .then(() => {
      hideLoading();
    })
    .catch(error => {
      console.error('Failed to run application', error);
      alert(`Failed to run application: ${error.message}`);
      hideLoading();
    });
}

// Open settings for the selected app
function openAppSettings() {
  if (!appState.selectedApp) return;
  console.log(`Opening settings for: ${appState.selectedApp.name}`);
  
  showLoading('Loading settings...');
  
  // Load app-specific settings
  Storage.loadAppSettings(appState.selectedApp.id)
    .then(settings => {
      // Populate the settings form
      const form = document.getElementById('settings-form');
      
      // Set screen size
      const screenSizeSelect = form.querySelector('#screen-size');
      screenSizeSelect.value = settings.screenSize || 'original';
      
      // Set orientation
      const orientationSelect = form.querySelector('#orientation');
      orientationSelect.value = settings.orientation || 'auto';
      
      // Set font size
      const fontSizeSelect = form.querySelector('#font-size');
      fontSizeSelect.value = settings.fontSize || 'medium';
      
      // Set sound enabled
      const soundEnabledCheckbox = form.querySelector('#sound-enabled');
      soundEnabledCheckbox.checked = settings.soundEnabled !== false;
      
      navigateToScreen('app-settings');
      hideLoading();
    })
    .catch(error => {
      console.error('Failed to load settings', error);
      alert(`Failed to load settings: ${error.message}`);
      hideLoading();
    });
}

// Save settings for the selected app
function saveAppSettings() {
  if (!appState.selectedApp) return;
  
  showLoading('Saving settings...');
  
  // Get values from the form
  const form = document.getElementById('settings-form');
  const settings = {
    screenSize: form.querySelector('#screen-size').value,
    orientation: form.querySelector('#orientation').value,
    fontSize: form.querySelector('#font-size').value,
    soundEnabled: form.querySelector('#sound-enabled').checked,
    keyMapping: getDefaultKeyMapping() // We'll use default key mapping for now
  };
  
  // Save the settings
  Storage.saveAppSettings(appState.selectedApp.id, settings)
    .then(() => {
      console.log('Settings saved successfully');
      navigateToScreen('app-details');
      hideLoading();
    })
    .catch(error => {
      console.error('Failed to save settings', error);
      alert(`Failed to save settings: ${error.message}`);
      hideLoading();
    });
}

// Get default key mapping
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

// Confirm deletion of the selected app
function confirmDeleteApp() {
  if (!appState.selectedApp) return;
  
  if (confirm(`Delete ${appState.selectedApp.name}?`)) {
    deleteApp(appState.selectedApp.id);
  }
}

// Delete an application
function deleteApp(appId) {
  console.log(`Deleting application with ID: ${appId}`);
  
  showLoading('Deleting application...');
  
  // Get the app data
  Database.getAppData(appId)
    .then(appData => {
      // Delete the app data from the database
      return Database.deleteAppData(appId)
        .then(() => {
          // Delete the JAR file if it exists
          if (appData.path) {
            return Storage.deleteFile(appData.path)
              .catch(error => {
                console.warn(`Failed to delete JAR file: ${appData.path}`, error);
                // Continue even if file deletion fails
              });
          }
        });
    })
    .then(() => {
      console.log(`Application deleted: ${appId}`);
      
      // Reset selection
      appState.selectedApp = null;
      appState.selectedAppIndex = -1;
      
      // Refresh the app list
      return loadInstalledApps();
    })
    .then(() => {
      // Navigate back to app list
      navigateToScreen('app-list');
      hideLoading();
    })
    .catch(error => {
      console.error('Failed to delete application', error);
      alert(`Failed to delete application: ${error.message}`);
      hideLoading();
    });
}

// Open the file browser to install a new app
function openFileBrowser() {
  console.log('Opening file browser');
  
  showLoading('Opening file browser...');
  
  // Set initial path
  appState.currentPath = '/sdcard/';
  
  navigateToScreen('file-browser');
  
  // Initialize the file browser
  FileBrowser.init(appState.currentPath);
  
  hideLoading();
}

// Navigate to a different screen
function navigateToScreen(screenId) {
  // Hide all screens
  Object.values(screens).forEach(screen => {
    screen.classList.remove('active');
  });
  
  // Show the requested screen
  screens[screenId.replace('-', '')].classList.add('active');
  
  // Update app state
  appState.currentScreen = screenId;
  
  // Update softkeys for the new screen
  updateSoftkeys();
  
  // Initialize navigation for the new screen if applicable
  if (window.Navigation) {
    Navigation.init(screenId);
  }
}

// Update softkey labels based on current screen
function updateSoftkeys() {
  switch (appState.currentScreen) {
    case 'app-list':
      elements.softkeyLeft.textContent = 'Install';
      elements.softkeyCenter.textContent = appState.appList.length > 0 ? 'Open' : '';
      elements.softkeyRight.textContent = 'Exit';
      break;
    case 'app-details':
      elements.softkeyLeft.textContent = '';
      elements.softkeyCenter.textContent = 'Run';
      elements.softkeyRight.textContent = 'Back';
      break;
    case 'app-settings':
      elements.softkeyLeft.textContent = '';
      elements.softkeyCenter.textContent = 'Save';
      elements.softkeyRight.textContent = 'Back';
      break;
    case 'emulator-screen':
      elements.softkeyLeft.textContent = 'Menu';
      elements.softkeyCenter.textContent = 'Select';
      elements.softkeyRight.textContent = 'Back';
      break;
    case 'file-browser':
      elements.softkeyLeft.textContent = '';
      elements.softkeyCenter.textContent = 'Select';
      elements.softkeyRight.textContent = 'Back';
      break;
    default:
      elements.softkeyLeft.textContent = '';
      elements.softkeyCenter.textContent = '';
      elements.softkeyRight.textContent = 'Back';
  }
}

// Handle key presses
function handleKeyDown(e) {
  // Skip if loading
  if (appState.isLoading) return;
  
  console.log(`Key pressed: ${e.key}`);
  
  // Handle emulator screen keys separately
  if (appState.currentScreen === 'emulator-screen') {
    handleEmulatorKeys(e);
    return;
  }
  
  // Handle file browser keys separately
  if (appState.currentScreen === 'file-browser') {
    FileBrowser.handleKeys(e.key);
    e.preventDefault();
    return;
  }
  
  switch (e.key) {
    case 'ArrowUp':
      handleArrowUp();
      e.preventDefault();
      break;
    case 'ArrowDown':
      handleArrowDown();
      e.preventDefault();
      break;
    case 'ArrowLeft':
      handleArrowLeft();
      e.preventDefault();
      break;
    case 'ArrowRight':
      handleArrowRight();
      e.preventDefault();
      break;
    case 'Enter':
      handleEnter();
      e.preventDefault();
      break;
    case 'Backspace':
      handleBackspace();
      e.preventDefault();
      break;
    case 'SoftLeft':
    case 'F1':
      handleSoftLeft();
      e.preventDefault();
      break;
    case 'SoftRight':
    case 'F2':
    case 'Escape':
      handleSoftRight();
      e.preventDefault();
      break;
  }
}

// Handle emulator keys
function handleEmulatorKeys(e) {
  // Map KaiOS keys to J2ME keys
  const keyMap = {
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
  
  // Handle softkeys
  if (e.key === 'SoftRight' || e.key === 'F2' || e.key === 'Escape') {
    stopEmulation();
    navigateToScreen('app-details');
    e.preventDefault();
    return;
  }
  
  if (e.key === 'SoftLeft' || e.key === 'F1') {
    // Show emulator menu (not implemented yet)
    e.preventDefault();
    return;
  }
  
  // Map key to J2ME key
  const j2meKey = keyMap[e.key];
  if (j2meKey) {
    EmulatorCore.handleKeyDown(j2meKey);
    e.preventDefault();
  }
}

// Stop emulation
function stopEmulation() {
  EmulatorCore.stop()
    .then(() => {
      console.log('Emulation stopped');
    })
    .catch(error => {
      console.error('Failed to stop emulation', error);
    });
}

// Handle Up arrow key
function handleArrowUp() {
  switch (appState.currentScreen) {
    case 'app-list':
      if (appState.selectedAppIndex > 0) {
        selectApp(appState.selectedAppIndex - 1);
      }
      break;
    case 'app-details':
      // Focus on previous button
      const buttons = document.querySelectorAll('.button-container button');
      const focusedIndex = Array.from(buttons).findIndex(btn => btn === document.activeElement);
      if (focusedIndex > 0) {
        buttons[focusedIndex - 1].focus();
      } else if (focusedIndex === -1) {
        buttons[0].focus();
      }
      break;
    case 'app-settings':
      // Focus on previous form element
      const formElements = document.querySelectorAll('#settings-form select, #settings-form input');
      const formFocusedIndex = Array.from(formElements).findIndex(el => el === document.activeElement);
      if (formFocusedIndex > 0) {
        formElements[formFocusedIndex - 1].focus();
      } else if (formFocusedIndex === -1) {
        formElements[0].focus();
      }
      break;
  }
}

// Handle Down arrow key
function handleArrowDown() {
  switch (appState.currentScreen) {
    case 'app-list':
      if (appState.selectedAppIndex < appState.appList.length - 1) {
        selectApp(appState.selectedAppIndex + 1);
      }
      break;
    case 'app-details':
      // Focus on next button
      const buttons = document.querySelectorAll('.button-container button');
      const focusedIndex = Array.from(buttons).findIndex(btn => btn === document.activeElement);
      if (focusedIndex < buttons.length - 1) {
        buttons[focusedIndex + 1].focus();
      } else if (focusedIndex === -1) {
        buttons[0].focus();
      }
      break;
    case 'app-settings':
      // Focus on next form element
      const formElements = document.querySelectorAll('#settings-form select, #settings-form input');
      const formFocusedIndex = Array.from(formElements).findIndex(el => el === document.activeElement);
      if (formFocusedIndex < formElements.length - 1) {
        formElements[formFocusedIndex + 1].focus();
      } else if (formFocusedIndex === -1) {
        formElements[0].focus();
      }
      break;
  }
}

// Handle Left arrow key
function handleArrowLeft() {
  // Implement as needed
}

// Handle Right arrow key
function handleArrowRight() {
  // Implement as needed
}

// Handle Enter key
function handleEnter() {
  switch (appState.currentScreen) {
    case 'app-list':
      if (appState.selectedApp) {
        openAppDetails();
      }
      break;
    case 'app-details':
      // Check if a button is focused
      const focusedButton = document.querySelector('.button-container button:focus');
      if (focusedButton) {
        focusedButton.click();
      } else {
        runSelectedApp();
      }
      break;
    case 'app-settings':
      // Check if a form element is focused
      const focusedElement = document.querySelector('#settings-form select:focus, #settings-form input:focus');
      if (focusedElement) {
        if (focusedElement.tagName === 'SELECT') {
          // Toggle dropdown
          if (focusedElement.size === 1) {
            focusedElement.size = 3;
          } else {
            focusedElement.size = 1;
          }
        } else if (focusedElement.type === 'checkbox') {
          focusedElement.checked = !focusedElement.checked;
        }
      } else {
        saveAppSettings();
      }
      break;
  }
}

// Handle Backspace key
function handleBackspace() {
  handleSoftRight();
}

// Handle SoftLeft key
function handleSoftLeft() {
  switch (appState.currentScreen) {
    case 'app-list':
      openFileBrowser();
      break;
    // Handle other screens
  }
}

// Handle SoftRight key
function handleSoftRight() {
  switch (appState.currentScreen) {
    case 'app-list':
      // In a real app, this would close the application
      break;
    case 'app-details':
    case 'app-settings':
      navigateToScreen('app-list');
      break;
    case 'file-browser':
      navigateToScreen('app-list');
      break;
    case 'emulator-screen':
      // Stop emulation and return to app details
      stopEmulation();
      navigateToScreen('app-details');
      break;
  }
}

// Initialize the application when the DOM is ready
document.addEventListener('DOMContentLoaded', initApp);
