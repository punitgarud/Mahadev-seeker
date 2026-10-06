const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);

// Block engine folder
config.resolver.blockList = [/.*\/engine\/.*/];

// FIX for Solana Mobile Wallet Adapter
config.resolver.unstable_enablePackageExports = true;
config.resolver.unstable_conditionNames = ['browser', 'require', 'react-native'];

module.exports = config;
