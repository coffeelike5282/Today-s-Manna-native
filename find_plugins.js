const path = require('path');
try {
    const rnPath = require.resolve('react-native/package.json');
    const pluginPath = require.resolve('@react-native/gradle-plugin/package.json', { paths: [rnPath] });
    console.log('RN_PLUGIN:', path.dirname(pluginPath));
    
    const expoPath = require.resolve('expo/package.json');
    const autolinkPath = require.resolve('expo-modules-autolinking/package.json', { paths: [expoPath] });
    console.log('EXPO_AUTOLINK:', path.dirname(autolinkPath));
} catch (e) {
    console.error(e);
    process.exit(1);
}
