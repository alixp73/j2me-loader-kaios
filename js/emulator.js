/**
 * J2ME Loader for KaiOS
 * Emulator functionality
 */

// Emulator state
const emulatorState = {
  running: false,
  currentApp: null,
  canvas: null,
  context: null,
  keyMap: {
    // Map KaiOS keys to J2ME keys
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
  },
  // Mock screen data for demonstration
  mockScreen: {
    width: 240,
    height: 320,
    backgroundColor: '#000000',
    elements: [
      { type: 'rect', x: 0, y: 0, width: 240, height: 40, color: '#0000AA' },
      { type: 'text', x: 120, y: 25, text: 'J2ME App', color: '#FFFFFF', align: 'center' },
      { type: 'rect', x: 20, y: 60, width: 200, height: 200, color: '#FFFFFF' },
      { type: 'text', x: 120, y: 280, text: 'Menu', color: '#FFFFFF', align: 'center' },
      { type: 'text', x: 120, y: 300, text: 'Select', color: '#FFFFFF', align: 'center' },
      { type: 'text', x: 120, y: 320, text: 'Back', color: '#FFFFFF', align: 'center' }
    ]
  }
};

// Initialize the emulator
function initEmulator(app) {
  console.log(`Initializing emulator for app: ${app.name}`);
  
  emulatorState.currentApp = app;
  emulatorState.canvas = document.getElementById('emulator-canvas');
  emulatorState.context = emulatorState.canvas.getContext('2d');
  
  // Set canvas size
  resizeCanvas();
  
  // Add event listeners for key handling
  document.addEventListener('keydown', handleEmulatorKeyDown);
  document.addEventListener('keyup', handleEmulatorKeyUp);
  
  // Start the emulation
  startEmulation();
  
  // Handle window resize
  window.addEventListener('resize', resizeCanvas);
}

// Resize the canvas to fit the screen
function resizeCanvas() {
  const container = document.getElementById('emulator-screen');
  const keyboardHeight = document.getElementById('virtual-keyboard').offsetHeight;
  
  const availableHeight = container.offsetHeight - keyboardHeight;
  const availableWidth = container.offsetWidth;
  
  // Calculate the size while maintaining aspect ratio
  const aspectRatio = emulatorState.mockScreen.width / emulatorState.mockScreen.height;
  
  let width, height;
  
  if (availableWidth / aspectRatio <= availableHeight) {
    // Width is the limiting factor
    width = availableWidth;
    height = availableWidth / aspectRatio;
  } else {
    // Height is the limiting factor
    height = availableHeight;
    width = availableHeight * aspectRatio;
  }
  
  // Set canvas size
  emulatorState.canvas.width = emulatorState.mockScreen.width;
  emulatorState.canvas.height = emulatorState.mockScreen.height;
  
  // Set display size
  emulatorState.canvas.style.width = `${width}px`;
  emulatorState.canvas.style.height = `${height}px`;
  
  // Center the canvas
  emulatorState.canvas.style.marginLeft = `${(availableWidth - width) / 2}px`;
  
  // Render the current screen
  renderScreen();
}

// Start the emulation
function startEmulation() {
  console.log('Starting emulation');
  
  emulatorState.running = true;
  
  // In a real implementation, this would initialize the J2ME emulator
  // and load the JAR file
  
  // For now, just render a mock screen
  renderScreen();
}

// Stop the emulation
function stopEmulation() {
  console.log('Stopping emulation');
  
  emulatorState.running = false;
  
  // Remove event listeners
  document.removeEventListener('keydown', handleEmulatorKeyDown);
  document.removeEventListener('keyup', handleEmulatorKeyUp);
  window.removeEventListener('resize', resizeCanvas);
  
  // Clear the canvas
  if (emulatorState.context) {
    emulatorState.context.clearRect(0, 0, emulatorState.canvas.width, emulatorState.canvas.height);
  }
}

// Render the current screen
function renderScreen() {
  if (!emulatorState.context || !emulatorState.running) return;
  
  const ctx = emulatorState.context;
  const screen = emulatorState.mockScreen;
  
  // Clear the canvas
  ctx.fillStyle = screen.backgroundColor;
  ctx.fillRect(0, 0, screen.width, screen.height);
  
  // Draw screen elements
  screen.elements.forEach(element => {
    switch (element.type) {
      case 'rect':
        ctx.fillStyle = element.color;
        ctx.fillRect(element.x, element.y, element.width, element.height);
        break;
      case 'text':
        ctx.fillStyle = element.color;
        ctx.font = '16px sans-serif';
        ctx.textAlign = element.align || 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(element.text, element.x, element.y);
        break;
    }
  });
}

// Handle key down events
function handleEmulatorKeyDown(e) {
  if (!emulatorState.running) return;
  
  const j2meKey = emulatorState.keyMap[e.key];
  if (j2meKey) {
    console.log(`J2ME key down: ${j2meKey}`);
    
    // In a real implementation, this would send the key event to the J2ME emulator
    
    // Prevent default to avoid browser navigation
    e.preventDefault();
  }
}

// Handle key up events
function handleEmulatorKeyUp(e) {
  if (!emulatorState.running) return;
  
  const j2meKey = emulatorState.keyMap[e.key];
  if (j2meKey) {
    console.log(`J2ME key up: ${j2meKey}`);
    
    // In a real implementation, this would send the key event to the J2ME emulator
    
    // Prevent default to avoid browser navigation
    e.preventDefault();
  }
}

// Export functions for use in other modules
window.Emulator = {
  init: initEmulator,
  start: startEmulation,
  stop: stopEmulation
};
