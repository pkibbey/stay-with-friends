/**
 * Shared configuration files for Stay With Friends monorepo
 * 
 * This package provides consistent configuration across all apps and packages.
 */

module.exports = {
  eslint: require('./eslint'),
  jest: require('./jest'),
  typescript: require('./typescript.json'),
};