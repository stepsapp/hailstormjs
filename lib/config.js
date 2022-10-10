import fs from 'fs'
import paths from './modules/paths'

export default (() => {
    const applicationRootConfigPath = `${paths.applicationRoot}/hailstorm.config.js`;
    if (fs.existsSync(applicationRootConfigPath)) {
        const config = require(applicationRootConfigPath)
        return config.default
    }
    return {
        baseURL: 'http://localhost:3000',
        output: 'dist',
        defaultLocale: 'en',
        locales: ['en'],
    }
})()
