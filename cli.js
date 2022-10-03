#!/usr/bin/env node
'use strict'

require('./lib/modules/babel')
const helpers = require('./lib/modules/helpers')
const recursiveCopy = require('./lib/modules/recursiveCopyFiles')

const exec = async (cmd) => {
    switch (cmd) {
        case 'start':
            require('./lib/main')
            break
        case 'build':
            require('./lib/build')
            break
        case 'init':
            console.log('Copying tailwind config.')
            await recursiveCopy.copyFile(`${helpers.paths.moduleRoot}/tailwind.config.js`, `${helpers.paths.applicationRoot}/tailwind.config.js`)
            console.log('Copying files from module to application /src/pages.')
            await recursiveCopy.copyFiles(`${helpers.paths.moduleRoot}/src/pages`, `${helpers.paths.applicationRoot}/src/pages`)
            console.log('Copying files from module to application /src/public.')
            await recursiveCopy.copyFiles(`${helpers.paths.moduleRoot}/src/public`, `${helpers.paths.applicationRoot}/src/public`)
            console.log('Copying files from module to application /src/components.')
            await recursiveCopy.copyFiles(`${helpers.paths.moduleRoot}/src/components`, `${helpers.paths.applicationRoot}/src/components`)
            break
    }
}
var cmd = process.argv.slice(2)[0]
exec(cmd)
