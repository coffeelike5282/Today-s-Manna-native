const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

const defaultBlockList = config.resolver.blockList || [];
config.resolver.blockList = [
    ...defaultBlockList,
    /bundle_.*\.js$/,
    /android_bundle\.js$/,
    /.*\.backup$/,
    /.*\.hbc$/,
    /.*\.txt$/,
    /.*\.log$/,
];

config.transformer.getTransformOptions = async () => ({
    transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
    },
});

module.exports = config;
