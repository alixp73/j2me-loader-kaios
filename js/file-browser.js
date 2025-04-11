/**
 * J2ME Loader for KaiOS
 * File browser functionality using KaiOS deviceStorage API
 */

// File browser state
const browserState = {
  currentPath: '/sdcard/',
  files: [],
  selectedIndex: 0,
  storage: null,
  allStorages: []
};

// DOM Elements
const browserElements = {
  currentPath: document.getElementById('current-path'),
  fileList: document.getElementById('file-list')
};

// Initialize the file browser
function initFileBrowser(path) {
  console.log(`Initializing file browser at path: ${path}`);
  browserState.currentPath = path || '/sdcard/';
  browserState.selectedIndex = 0;
  
  // Initialize device storage
  initDeviceStorage()
    .then(() => {
      // Update UI
      updatePathDisplay();
      
      // Load files from the current path
      loadFiles(browserState.currentPath);
    })
    .catch(error => {
      console.error('Failed to initialize device storage', error);
      alert('Failed to access device storage. Please check permissions.');
    });
}

// Initialize device storage
function initDeviceStorage() {
  return new Promise((resolve, reject) => {
    try {
      // Check if deviceStorage API is available
      if (!navigator.getDeviceStorage) {
        reject(new Error('DeviceStorage API not available'));
        return;
      }
      
      // Get the default storage (sdcard)
      browserState.storage = navigator.getDeviceStorage('sdcard');
      
      // Get all available storages
      browserState.allStorages = navigator.getDeviceStorages('sdcard');
      
      console.log(`Found ${browserState.allStorages.length} storage(s)`);
      resolve();
    } catch (error) {
      console.error('Error initializing device storage', error);
      reject(error);
    }
  });
}

// Update the path display
function updatePathDisplay() {
  browserElements.currentPath.textContent = browserState.currentPath;
}

// Load files from the specified path
function loadFiles(path) {
  console.log(`Loading files from: ${path}`);
  
  // Clear the current list
  browserState.files = [];
  
  // Add parent directory if not at root
  if (path !== '/sdcard/') {
    browserState.files.push({
      name: '..',
      isDirectory: true,
      path: getParentPath(path)
    });
  }
  
  // Use the deviceStorage API to list files
  const cursor = browserState.storage.enumerate(path);
  
  cursor.onsuccess = function() {
    if (this.result) {
      const file = this.result;
      const fileName = file.name.split('/').pop();
      
      // Skip hidden files and placeholder files
      if (!fileName.startsWith('.') && !fileName.endsWith('.placeholder')) {
        // Determine if it's a directory by checking if it ends with '/'
        // This is a heuristic since deviceStorage doesn't directly tell us if it's a directory
        const isDirectory = file.name.endsWith('/') || 
                           !file.name.includes('.') || 
                           isKnownDirectory(file.name);
        
        browserState.files.push({
          name: fileName,
          isDirectory: isDirectory,
          path: file.name,
          size: file.size,
          lastModified: file.lastModifiedDate,
          file: file
        });
      }
      
      // Continue to the next file
      this.continue();
    } else {
      // No more files, sort and render the list
      sortFiles();
      renderFileList();
    }
  };
  
  cursor.onerror = function() {
    console.error(`Failed to list files in: ${path}`, this.error);
    alert(`Failed to list files: ${this.error.name}`);
    
    // Render what we have so far
    sortFiles();
    renderFileList();
  };
}

// Check if a path is a known directory
function isKnownDirectory(path) {
  const knownDirs = [
    '/sdcard/Download',
    '/sdcard/DCIM',
    '/sdcard/Pictures',
    '/sdcard/Music',
    '/sdcard/Videos',
    '/sdcard/Documents'
  ];
  
  return knownDirs.some(dir => path.startsWith(dir) && 
                        path.split('/').length === dir.split('/').length);
}

// Sort files (directories first, then alphabetically)
function sortFiles() {
  browserState.files.sort((a, b) => {
    // Parent directory always comes first
    if (a.name === '..') return -1;
    if (b.name === '..') return 1;
    
    // Directories come before files
    if (a.isDirectory && !b.isDirectory) return -1;
    if (!a.isDirectory && b.isDirectory) return 1;
    
    // Alphabetical sort
    return a.name.localeCompare(b.name);
  });
}

// Get the parent path
function getParentPath(path) {
  // Remove trailing slash if present
  if (path.endsWith('/')) {
    path = path.slice(0, -1);
  }
  
  // Find the last slash
  const lastSlashIndex = path.lastIndexOf('/');
  if (lastSlashIndex <= 0) {
    return '/';
  }
  
  // Return the parent path with trailing slash
  return path.substring(0, lastSlashIndex + 1);
}

// Render the file list
function renderFileList() {
  browserElements.fileList.innerHTML = '';
  
  if (browserState.files.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'No files found';
    li.classList.add('no-files');
    browserElements.fileList.appendChild(li);
    return;
  }
  
  browserState.files.forEach((file, index) => {
    const li = document.createElement('li');
    
    // Create icon based on file type
    const icon = document.createElement('span');
    icon.className = 'file-icon';
    
    if (file.name === '..') {
      icon.textContent = '📂 ';
    } else if (file.isDirectory) {
      icon.textContent = '📁 ';
    } else if (file.name.toLowerCase().endsWith('.jar')) {
      icon.textContent = '📱 ';
    } else {
      icon.textContent = '📄 ';
    }
    
    // Create name element
    const name = document.createElement('span');
    name.textContent = file.name;
    
    // Add elements to list item
    li.appendChild(icon);
    li.appendChild(name);
    
    // Add data attributes
    li.dataset.path = file.path;
    li.dataset.isDirectory = file.isDirectory;
    li.dataset.index = index;
    
    // Add focus class if selected
    if (index === browserState.selectedIndex) {
      li.classList.add('focused');
    }
    
    // Add click handler
    li.addEventListener('click', () => {
      selectFile(index);
    });
    
    browserElements.fileList.appendChild(li);
  });
}

// Select a file in the list
function selectFile(index) {
  if (index < 0 || index >= browserState.files.length) return;
  
  browserState.selectedIndex = index;
  
  // Update UI to show selection
  const items = browserElements.fileList.querySelectorAll('li');
  items.forEach(item => item.classList.remove('focused'));
  
  if (items[index]) {
    items[index].classList.add('focused');
    
    // Scroll to make the selected item visible if needed
    items[index].scrollIntoView({ block: 'nearest' });
  }
}

// Open the selected file or directory
function openSelected() {
  const selectedFile = browserState.files[browserState.selectedIndex];
  if (!selectedFile) return;
  
  if (selectedFile.isDirectory) {
    // Navigate to the directory
    let newPath = selectedFile.path;
    if (!newPath.endsWith('/')) {
      newPath += '/';
    }
    
    browserState.currentPath = newPath;
    updatePathDisplay();
    loadFiles(newPath);
  } else {
    // Check if it's a JAR file
    if (selectedFile.name.toLowerCase().endsWith('.jar')) {
      installJarFile(selectedFile);
    } else {
      alert('Please select a valid JAR file.');
    }
  }
}

// Install a JAR file
function installJarFile(fileInfo) {
  console.log(`Installing JAR file: ${fileInfo.path}`);
  
  // Get the file object
  browserState.storage.get(fileInfo.path)
    .onsuccess = function() {
      const file = this.result;
      
      // Extract metadata from the JAR file
      Storage.extractJarMetadata(file)
        .then(metadata => {
          // Save the app data to the database
          return Database.saveAppData(metadata)
            .then(() => {
              console.log(`Successfully installed: ${metadata.name}`);
              alert(`Successfully installed: ${metadata.name}`);
              
              // Refresh the app list
              loadInstalledApps();
              
              // Navigate back to the app list
              navigateToScreen('app-list');
            });
        })
        .catch(error => {
          console.error('Failed to install JAR file', error);
          alert(`Failed to install JAR file: ${error.message}`);
        });
    };
  
  browserState.storage.get(fileInfo.path)
    .onerror = function() {
      console.error(`Failed to get file: ${fileInfo.path}`, this.error);
      alert(`Failed to access file: ${this.error.name}`);
    };
}

// Get storage space information
function getStorageInfo() {
  return new Promise((resolve, reject) => {
    const freeRequest = browserState.storage.freeSpace();
    
    freeRequest.onsuccess = function() {
      const freeSpace = this.result;
      
      const usedRequest = browserState.storage.usedSpace();
      
      usedRequest.onsuccess = function() {
        const usedSpace = this.result;
        
        resolve({
          free: formatFileSize(freeSpace),
          used: formatFileSize(usedSpace),
          total: formatFileSize(freeSpace + usedSpace)
        });
      };
      
      usedRequest.onerror = function() {
        reject(this.error);
      };
    };
    
    freeRequest.onerror = function() {
      reject(this.error);
    };
  });
}

// Format file size in human-readable format
function formatFileSize(bytes) {
  if (bytes < 1024) {
    return bytes + ' B';
  } else if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(1) + ' KB';
  } else {
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
}

// Handle key navigation in the file browser
function handleFileBrowserKeys(key) {
  switch (key) {
    case 'ArrowUp':
      if (browserState.selectedIndex > 0) {
        selectFile(browserState.selectedIndex - 1);
      }
      break;
    case 'ArrowDown':
      if (browserState.selectedIndex < browserState.files.length - 1) {
        selectFile(browserState.selectedIndex + 1);
      }
      break;
    case 'Enter':
      openSelected();
      break;
  }
}

// Export functions for use in other modules
window.FileBrowser = {
  init: initFileBrowser,
  handleKeys: handleFileBrowserKeys,
  getStorageInfo: getStorageInfo
};
