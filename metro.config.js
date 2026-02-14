const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Enable modern package exports support
config.resolver.unstable_enablePackageExports = true;
config.resolver.sourceExts = [...config.resolver.sourceExts, "mjs"];

/**
 * GLOBAL METRO RESOLVER PATCH
 * 
 * Intercepts relative imports ending in .js and strips the extension.
 * This prevents Metro from double-appending extensions (e.g., validate.js.js)
 * which causes resolution failures in ESM packages on Windows.
 */
config.resolver.resolveRequest = (context, moduleName, platform) => {
    if (moduleName.startsWith('.') && moduleName.endsWith('.js')) {
        const redirectedName = moduleName.replace(/\.js$/, '');
        try {
            return context.resolveRequest(context, redirectedName, platform);
        } catch (e) {
            // Fallback to default if manual redirection fails
        }
    }
    return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: "./global.css" });
