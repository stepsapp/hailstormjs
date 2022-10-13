import fs from 'fs';
import paths from './modules/paths';

export default (() => {
  const applicationRootConfigPath = `${paths.applicationRoot}/hailstorm.config.js`;
  if (fs.existsSync(applicationRootConfigPath)) {
    // eslint-disable-next-line import/no-dynamic-require, global-require
    const config = require(applicationRootConfigPath);
    return config.default;
  }
  return {
    baseURL: 'http://localhost:3000',
    output: 'dist',
    defaultLocale: 'en',
    defaultLocales: ['en'],
  };
})();
