const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// On ajoute les extensions Windows pour que Metro les résolve en priorité
config.resolver.resolverMainFields = ['react-native-windows', 'browser', 'main'];
config.resolver.platforms = ['windows', 'android', 'ios', 'web'];

module.exports = config;
