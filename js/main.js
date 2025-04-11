/**
 * J2ME Loader for KaiOS
 * Main entry point
 */

// Import modules
import { Storage } from './storage.js';
import { Database } from './database.js';
import { FileBrowser } from './file-browser.js';
import { EmulatorCore } from './emulator-core.js';

// Make modules available globally
window.Storage = Storage;
window.Database = Database;
window.FileBrowser = FileBrowser;
window.EmulatorCore = EmulatorCore;

// Navigation helper for KaiOS
window.Navigation = {
  currentIndex: 0,
  elements: [],
  
  init: function(screenId) {
    // Get all focusable elements in the current screen
    const screen = document.getElementById(screenId);
    if (!screen) return;
    
    this.elements = Array.from(screen.querySelectorAll('button, select, input, a, [tabindex="0"]'));
    this.currentIndex = 0;
    
    // Focus the first element if available
    if (this.elements.length > 0) {
      this.elements[0].focus();
    }
  },
  
  navigate: function(direction) {
    if (this.elements.length === 0) return;
    
    if (direction === 'up' || direction === 'left') {
      this.currentIndex = (this.currentIndex - 1 + this.elements.length) % this.elements.length;
    } else if (direction === 'down' || direction === 'right') {
      this.currentIndex = (this.currentIndex + 1) % this.elements.length;
    }
    
    this.elements[this.currentIndex].focus();
  }
};

// Detect KaiOS version and capabilities
function detectKaiOSVersion() {
  const userAgent = navigator.userAgent;
  let version = 'unknown';
  
  if (userAgent.includes('KAIOS')) {
    // Extract version number
    const match = userAgent.match(/KAIOS\/(\d+\.\d+)/);
    if (match && match[1]) {
      version = match[1];
    }
  }
  
  console.log(`Detected KaiOS version: ${version}`);
  return version;
}

// Check for required permissions
function checkPermissions() {
  if (navigator.getDeviceStorage) {
    const storage = navigator.getDeviceStorage('sdcard');
    if (!storage) {
      console.warn('Device storage access is not available');
      return false;
    }
    return true;
  } else {
    console.warn('Device storage API is not available');
    return false;
  }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('J2ME Loader for KaiOS starting up...');
  
  // Detect KaiOS version
  const kaiOSVersion = detectKaiOSVersion();
  
  // Check permissions
  const hasPermissions = checkPermissions();
  if (!hasPermissions) {
    alert('This application requires access to device storage. Please grant the necessary permissions in the device settings.');
  }
  
  // Load the application script
  const appScript = document.createElement('script');
  appScript.src = 'js/app.js';
  appScript.onerror = function() {
    console.error('Failed to load app.js');
    alert('Failed to initialize the application. Please try again.');
  };
  document.body.appendChild(appScript);
});

// Handle global errors
window.onerror = function(message, source, lineno, colno, error) {
  console.error('Global error:', message, 'at', source, lineno, colno, error);
  
  // Show error to user for critical errors
  if (error && error.isCritical) {
    alert(`An error occurred: ${message}`);
  }
  
  return true; // Prevent default error handling
};
