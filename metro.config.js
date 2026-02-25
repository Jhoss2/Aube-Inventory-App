const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/utils/metro-config');

const config = getDefaultConfig(__dirname);

// On ajoute la configuration NativeWind par-dessus la config par défaut
module.exports = withNativeWind(config, { input: './global.css' });
