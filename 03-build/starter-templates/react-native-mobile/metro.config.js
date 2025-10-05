const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add NativeWind support
config.resolver.sourceExts.push('css');

module.exports = config;
