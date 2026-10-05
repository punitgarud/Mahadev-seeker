const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);
config.resolver.blockList = [/.*\/engine\/.*/, /.*\/\.github\/.*/];
module.exports = config;
