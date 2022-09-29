const path = require('path')
const fs = require('fs')
const helpers = require('./lib/modules/helpers')
require('./lib/modules/babel')
const recursiveCopy = require('./lib/modules/recursiveCopyFiles')
var nodemon = require('nodemon')

console.log(helpers.paths)

var cmd = process.argv.slice(2)[0]
switch (cmd) {
    case 'start':
        require('./lib/main')
        break
    case 'build':
        require('./lib/build')
        break
    case 'init':
        console.log('Copying files from module to application /src/pages')
        await recursiveCopy.copyFiles(`${helpers.paths.moduleRoot}/src/pages`, `${helpers.paths.applicationRoot}/src/pages`)
        console.log('Copying files from module to application /src/public')
        await recursiveCopy.copyFiles(`${helpers.paths.moduleRoot}/src/public`, `${helpers.paths.applicationRoot}/src/public`)
        console.log('Copying files from module to application /src/components')
        await recursiveCopy.copyFiles(`${helpers.paths.moduleRoot}/src/components`, `${helpers.paths.applicationRoot}/src/components`)
        break
    case 'watch':
        nodemon({
            script: `${helpers.paths.moduleRoot}/lib/main.js`,
            ext: 'js json css jsx html',
            ignore: ['cache/**', 'dist/**'],
        })
        nodemon
            .on('start', function () {
                console.log('Building App.')
            })
            .on('quit', function () {
                console.log('App has quit')
                process.exit()
            })
            .on('restart', function (files) {
                console.log('Re-Building App because of changes.')
            })
        break
}
