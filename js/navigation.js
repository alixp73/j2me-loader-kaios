/**
 * J2ME Loader for KaiOS
 * Navigation and keyboard handling
 */

// Navigation state
const navState = {
  // Current focused element in each screen
  focusMap: {
    'app-list': {
      selector: '#apps li',
      currentIndex: 0
    },
    'app-details': {
      selector: '.button-container button',
      currentIndex: 0
    },
    'app-settings': {
      selector: '#settings-form select, #settings-form input[type="checkbox"]',
      currentIndex: 0
    },
    'file-browser': {
      selector: '#file-list li',
      currentIndex: 0
    }
  }
};

// Initialize navigation for the current screen
function initNavigation(screenId) {
  const navConfig = navState.focusMap[screenId];
  if (!navConfig) return;
  
  const elements = document.querySelectorAll(navConfig.selector);
  if (elements.length === 0) return;
  
  // Reset current index if out of bounds
  if (navConfig.currentIndex >= elements.length) {
    navConfig.currentIndex = 0;
  }
  
  // Set focus on the current element
  setFocus(screenId, navConfig.currentIndex);
}

// Set focus on an element in the current screen
function setFocus(screenId, index) {
  const navConfig = navState.focusMap[screenId];
  if (!navConfig) return;
  
  const elements = document.querySelectorAll(navConfig.selector);
  if (elements.length === 0) return;
  
  // Remove focus from all elements
  elements.forEach(el => {
    el.classList.remove('focused');
    if (el.tagName === 'INPUT' || el.tagName === 'SELECT') {
      el.blur();
    }
  });
  
  // Set focus on the specified element
  const element = elements[index];
  element.classList.add('focused');
  
  if (element.tagName === 'INPUT' || element.tagName === 'SELECT') {
    element.focus();
  }
  
  // Update current index
  navConfig.currentIndex = index;
}

// Navigate to the next element in the current screen
function navNext(screenId) {
  const navConfig = navState.focusMap[screenId];
  if (!navConfig) return;
  
  const elements = document.querySelectorAll(navConfig.selector);
  if (elements.length === 0) return;
  
  let nextIndex = navConfig.currentIndex + 1;
  if (nextIndex >= elements.length) {
    nextIndex = 0; // Wrap around
  }
  
  setFocus(screenId, nextIndex);
}

// Navigate to the previous element in the current screen
function navPrev(screenId) {
  const navConfig = navState.focusMap[screenId];
  if (!navConfig) return;
  
  const elements = document.querySelectorAll(navConfig.selector);
  if (elements.length === 0) return;
  
  let prevIndex = navConfig.currentIndex - 1;
  if (prevIndex < 0) {
    prevIndex = elements.length - 1; // Wrap around
  }
  
  setFocus(screenId, prevIndex);
}

// Activate the currently focused element
function activateFocused(screenId) {
  const navConfig = navState.focusMap[screenId];
  if (!navConfig) return;
  
  const elements = document.querySelectorAll(navConfig.selector);
  if (elements.length === 0) return;
  
  const element = elements[navConfig.currentIndex];
  
  if (element.tagName === 'INPUT' && element.type === 'checkbox') {
    element.checked = !element.checked;
    return;
  }
  
  if (element.tagName === 'SELECT') {
    // Toggle dropdown
    if (element === document.activeElement) {
      element.blur();
    } else {
      element.focus();
    }
    return;
  }
  
  // Simulate a click event
  element.click();
}

// Handle D-pad navigation
function handleDPad(key, screenId) {
  switch (key) {
    case 'ArrowUp':
      navPrev(screenId);
      break;
    case 'ArrowDown':
      navNext(screenId);
      break;
    case 'Enter':
      activateFocused(screenId);
      break;
  }
}

// Export functions for use in other modules
window.Navigation = {
  init: initNavigation,
  setFocus: setFocus,
  next: navNext,
  prev: navPrev,
  activate: activateFocused,
  handleDPad: handleDPad
};
