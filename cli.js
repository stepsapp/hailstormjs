#!/usr/bin/env node
'use strict'

require('./lib/modules/babel')

const exec = async (cmd) => {
    const pjson = require('./package.json')
    const { paths, copyFiles, copyFile } = require('./lib/modules/common')
    const logger = require('./lib/modules/logger').default
    logger.debug(`Hailstorm - ${pjson.version}`)

    switch (cmd) {
        case 'start':
            require('./lib/main')
            break
        case 'build':
            require('./lib/build')
            break
        case 'init':
            logger.debug('Copying hailstorm config.')
            await copyFile(`${paths.moduleRoot}/hailstorm.config.js`, `${paths.applicationRoot}/hailstorm.config.js`)
            logger.debug('Copying tailwind config.')
            await copyFile(`${paths.moduleRoot}/tailwind.config.js`, `${paths.applicationRoot}/tailwind.config.js`)
            logger.debug('Copying requirements')
            await copyFiles(`${paths.moduleRoot}/src`, `${paths.applicationRoot}/src`, {})
            break
    }
}

var cmd = process.argv.slice(2)[0]
exec(cmd)
