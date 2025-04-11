# Testing J2ME-Loader with KaiOS WebIDE and Simulator

## Environment Setup

1. Download and install the official KaiOS WebIDE from:
   https://developer.kaiostech.com/docs/getting-started/env-setup/simulator/

2. Install ADB (Android Debug Bridge) if not already installed:
   - Windows: Download the SDK Platform Tools from Android Developer website
   - Add ADB to your system PATH

## Setting Up the Simulator

1. Launch KaiOS WebIDE
2. In WebIDE, go to Runtime > Simulator
3. Select the appropriate device model (e.g., 8110, 2720)
4. Start the simulator

## Installing the App

1. In WebIDE:
   - Click "Open Packaged App"
   - Navigate to the j2me-loader-kaios directory
   - Select the manifest.webapp file

2. Verify app configuration:
   - Check manifest.webapp permissions
   - Ensure all required files are present
   - Verify icons are available

3. Install and run:
   - Click "Install and Run" in WebIDE
   - Accept any permission prompts in the simulator

## Testing Procedures

### Basic Navigation
1. Verify app launches correctly
2. Test D-pad navigation:
   - Up/Down: Navigate through app list
   - Left/Right: Access different screens
   - Center: Select items
   - Softkeys: Test all three softkey functions

### File Operations
1. Test JAR file installation:
   - Use file browser
   - Navigate storage
   - Select and install JAR files

### App Management
1. Verify app list display
2. Test app details view
3. Check settings configuration:
   - Screen size options
   - Orientation settings
   - Font size adjustment
   - Sound controls

### Emulator Function
1. Test J2ME app launching
2. Verify display settings
3. Check keyboard mapping
4. Test sound output

## Debugging

### Using WebIDE Console
1. Open Developer Tools (F12)
2. Monitor JavaScript console
3. Check for errors and warnings
4. Test storage operations

### Common Issues

1. Storage Permission:
   ```javascript
   // Verify storage access
   navigator.getDeviceStorage('sdcard')
     .then(storage => console.log('Storage access granted'))
     .catch(error => console.error('Storage access denied:', error));
   ```

2. App Installation:
   - Verify manifest.webapp structure
   - Check file permissions
   - Validate icon paths

3. Performance:
   - Monitor memory usage
   - Check file loading times
   - Verify emulator responsiveness

## Notes

- The simulator may have different performance characteristics than real devices
- Some device APIs might behave differently in the simulator
- Always test critical features on real hardware when possible
- Use the simulator primarily for rapid development and basic testing