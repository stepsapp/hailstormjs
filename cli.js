#!/usr/bin/env node
'use strict'

require('./lib/modules/babel')

const { paths, copyFiles, copyFile } = require('./lib/modules/common')

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
            await copyFile(`${paths.moduleRoot}/tailwind.config.js`, `${paths.applicationRoot}/tailwind.config.js`)
            console.log('Copying requirements')
            await copyFiles(`${paths.moduleRoot}/src`, `${paths.applicationRoot}/src`)
            break
    }
}
var cmd = process.argv.slice(2)[0]
exec(cmd)
