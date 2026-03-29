const { getDefaultConfig } = require('expo/metro-config');
const { mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const expoConfig = getDefaultConfig(__dirname);

const customConfig = {
    resolver: {
        blockList: [
            ...(expoConfig.resolver.blockList || []),
            /bundle_.*\.js$/,
            /android_bundle\.js$/,
            /.*\.backup$/,
            /.*\.hbc$/,
            /.*\.txt$/,
            /.*\.log$/,
        ],
    },
    transformer: {
        getTransformOptions: async () => ({
            transform: {
                experimentalImportSupport: false,
                inlineRequires: true,
            },
        }),
    },
};

module.exports = mergeConfig(expoConfig, customConfig);
