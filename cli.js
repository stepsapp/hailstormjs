
const path = require('path')
const fs = require('fs')
var babelConfig = path.join(__dirname, '/lib/config/babel.config.json')

require('@babel/register')({
    ignore: [],
    configFile: babelConfig,
})
require('@babel/preset-env')
require('@babel/preset-react')

const appDirFullPath = path.dirname(require.main.filename)
const appDirRegexResp = /^(.*?)node_modules/.exec(appDirFullPath)
var appDir = appDirRegexResp ? appDirRegexResp[1] : appDirFullPath
appDir = appDir.endsWith('/') ? appDir.slice(0, -1) : appDir

var cmd = process.argv.slice(2)[0]
switch (cmd) {
    case 'init':
        if (!fs.existsSync(`${appDir}/src`)) {
            require(`${appDirFullPath}/lib/modules/recursiveCopyFiles`).copyFiles(`${appDirFullPath}/src`, `${appDir}/src`)
        }
        break;
    case 'start':
        require('./lib/main')
        break
    case 'build':
        require('./lib/build')
        break
    case 'watch':
        const watch = require('./lib/watcher')
        watch()
        break
}
