# J2ME-Loader for KaiOS

A port of the J2ME-Loader emulator for KaiOS devices, allowing you to run Java ME applications and games on your KaiOS phone.

## Overview

This application provides a web-based interface for running J2ME (Java Micro Edition) applications on KaiOS devices. It's a port of the [J2ME-Loader](https://github.com/nikita36078/J2ME-Loader) Android application, optimized for the KaiOS platform.

## Features

- Browse and manage installed J2ME applications
- Install new applications from JAR files
- Configure application-specific settings (screen size, orientation, sound)
- KaiOS device storage integration for file management
- Optimized for KaiOS devices with D-pad navigation
- IndexedDB storage for application metadata

## Installation

### For Developers

1. Clone this repository:
   ```
   git clone https://github.com/yourusername/j2me-loader-kaios.git
   ```

2. Install the KaiOS development tools:
   - [KaiOS IDE](https://developer.kaiostech.com/docs/development/build-your-first-package-app/test-your-apps)
   - [WebIDE](https://developer.kaiostech.com/docs/development/build-your-first-package-app/test-your-apps#webide-with-real-device)

3. Connect your KaiOS device or use the simulator.

4. Deploy the application using WebIDE or the KaiOS simulator.

### For Users

1. Download the latest release package.
2. Install the application on your KaiOS device using WebIDE or the KaiStore (if available).
3. Launch the application from your device's app menu.
4. Grant the necessary permissions when prompted (access to device storage).

## Usage

### Navigation

- Use the D-pad to navigate through the application.
- Press the Center key to select items.
- Use the Left and Right softkeys for context-specific actions.

### Installing Applications

1. Press the Left softkey (Install) on the main screen.
2. Navigate to the location of your JAR files using the file browser.
3. Select a JAR file to install.
4. The application will be installed and appear in your app list.

### Running Applications

1. Select an application from the list.
2. Press the Center key to view details.
3. Press the Center key again or select "Run" to launch the application.
4. Use the D-pad and keypad to control the J2ME application.
5. Press the Right softkey to exit the application and return to the details screen.

### Application Settings

1. Select an application from the list.
2. Press the Center key to view details.
3. Select "Settings" to configure application-specific options:
   - Screen Size: Original, Stretched, or Scaled
   - Orientation: Auto, Portrait, or Landscape
   - Font Size: Small, Medium, or Large
   - Sound: Enable or disable sound

## Technical Implementation

### Storage Architecture

The application uses a combination of KaiOS deviceStorage API and IndexedDB:

- **deviceStorage API**: Used for saving and loading JAR files and other binary data.
- **IndexedDB**: Used for storing application metadata, settings, and configuration.

### Key Components

- **storage.js**: Handles file operations using the KaiOS deviceStorage API.
- **database.js**: Manages application data using IndexedDB.
- **file-browser.js**: Provides a file browser interface for selecting JAR files.
- **emulator-core.js**: Implements the core functionality of the J2ME emulator.
- **app.js**: Main application logic and UI management.
- **navigation.js**: Handles KaiOS-specific navigation patterns.

## Limitations

- This is a web-based port and may not provide the same performance as the Android version.
- Some J2ME features may not be fully supported.
- Large or complex J2ME applications may not run optimally on lower-end KaiOS devices.
- Access to device storage requires appropriate permissions.

## Development Status

This project is currently in beta. Some features of the original J2ME-Loader may not be available yet.

## Future Enhancements

- Improved performance for larger JAR files
- Better keyboard mapping configuration
- Support for more J2ME APIs
- Enhanced UI for different KaiOS device screen sizes
- Localization support for multiple languages

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the Apache License 2.0 - see the LICENSE file for details.

## Acknowledgments

- [J2ME-Loader](https://github.com/nikita36078/J2ME-Loader) - The original Android application
- [KaiOS](https://www.kaiostech.com/) - The target platform
