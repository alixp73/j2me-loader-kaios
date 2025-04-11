# Testing J2ME-Loader in KaiOS Simulator

## Prerequisites

1. Install Node.js (version 12 or higher)
2. Install the KaiOS simulator globally:
   ```bash
   npm install -g @kaiostech/simulator
   ```

## Setting Up the Project

1. Navigate to the project directory:
   ```bash
   cd j2me-loader-kaios
   ```

2. Install project dependencies (if any):
   ```bash
   npm install
   ```

## Running in the Simulator

1. Start the KaiOS simulator:
   ```bash
   kaiostech-simulator
   ```

2. Once the simulator is running, access the WebIDE interface at:
   ```
   http://localhost:6060
   ```

3. In the WebIDE:
   - Click "Select App" and choose the project directory
   - Verify the manifest.webapp file is detected
   - Click "Install and Run"

## Testing Guidelines

### Basic Functionality
1. Verify the app launches correctly
2. Test D-pad navigation through the app list
3. Check softkey functionality (Options, Select, Back)
4. Test file browser navigation

### App Management
1. Test JAR file installation
2. Verify app details display
3. Test app settings configuration
4. Verify app deletion works

### Emulator Features
1. Test app launching
2. Verify screen size options
3. Check orientation settings
4. Test sound functionality
5. Verify virtual keyboard operation

### Storage Access
1. Verify storage permission requests
2. Test file read/write operations
3. Check IndexedDB functionality

## Debugging

- Use the WebIDE console for JavaScript errors
- Check storage permissions if file operations fail
- Monitor memory usage for large JAR files
- Use the simulator's device storage panel for file system issues

## Known Simulator Limitations

1. Storage access might behave differently than on real devices
2. Performance may not reflect actual device performance
3. Some device-specific APIs might not be fully implemented
4. Touch events simulation may differ from physical D-pad interaction

## Troubleshooting

### Common Issues
1. App not installing:
   - Verify manifest.webapp is valid
   - Check file permissions
   - Clear simulator cache

2. Storage access denied:
   - Verify permissions in manifest.webapp
   - Restart simulator
   - Check WebIDE console for errors

3. App crashes:
   - Check memory usage
   - Verify JAR file compatibility
   - Review console logs

### Performance Optimization
1. Monitor memory usage
2. Test with various JAR file sizes
3. Profile JavaScript execution
4. Optimize asset loading

## Next Steps

1. Document any simulator-specific issues
2. Compare behavior with real devices
3. Optimize based on simulator testing results
4. Prepare for device testing phase