const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

// Metro configuration for React Native Reanimated
/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const defaultConfig = getDefaultConfig(__dirname);

const config = {
  resolver: {
    // Merge default source extensions and add 'cjs' if required
    sourceExts: [...defaultConfig.resolver.sourceExts, 'cjs'],
  },
  transformer: {
    // Add Reanimated's transformer
    babelTransformerPath: require.resolve('react-native-reanimated/scripts/reanimated-transformer'),
  },
  watchFolders: [
    // Ensure the `react-native-reanimated` folder is properly watched
    path.resolve(__dirname, 'node_modules/react-native-reanimated'),
  ],
  // Enable experimental features if required (optional, remove if unnecessary)
  server: {
    enhanceMiddleware: (middleware) => {
      return (req, res, next) => {
        // Add custom headers or debugging logic if needed
        return middleware(req, res, next);
      };
    },
  },
};

module.exports = mergeConfig(defaultConfig, config);

