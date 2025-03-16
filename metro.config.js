const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

const defaultConfig = getDefaultConfig(__dirname);

const config = {
  resolver: {
    sourceExts: [...defaultConfig.resolver.sourceExts, 'cjs'],
  },
  watchFolders: [
    path.resolve(__dirname, 'node_modules/react-native-reanimated'),
  ],
  server: {
    enhanceMiddleware: (middleware) => {
      return (req, res, next) => {
        return middleware(req, res, next);
      };
    },
  },
};

module.exports = mergeConfig(defaultConfig, config);

