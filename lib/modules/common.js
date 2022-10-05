const fs = require('fs')
const { extname } = require('path')
const path = require('path')
const pino = require('pino')

const logger = pino({
    transport: {
        target: 'pino-pretty',
    },
})

const paths = () => {
    const currentDir = __dirname
    var applicationRoot = null
    var moduleRoot = null
    const isInNodeModules = /^(.*?)node_modules/
    const isInNodeModulesModule = /^(.*?\/hailstormjs)/
    const isInLibModules = /^(.*?)lib\/modules/
    if (currentDir.match(isInNodeModules) && !currentDir.match(isInLibModules)) {
        applicationRoot = isInNodeModules.exec(currentDir)[1]
        moduleRoot = isInNodeModulesModule.exec(currentDir)[1]
    } else if (currentDir.match(isInNodeModules) && currentDir.match(isInLibModules)) {
        applicationRoot = isInNodeModules.exec(currentDir)[1]
        moduleRoot = isInLibModules.exec(currentDir)[1]
    } else if (currentDir.match(isInLibModules)) {
        applicationRoot = isInLibModules.exec(currentDir)[1]
        moduleRoot = isInLibModules.exec(currentDir)[1]
    } else {
        applicationRoot = currentDir
        moduleRoot = currentDir
    }
    applicationRoot = applicationRoot.endsWith('/') ? applicationRoot.slice(0, -1) : applicationRoot
    moduleRoot = moduleRoot.endsWith('/') ? moduleRoot.slice(0, -1) : moduleRoot
    return { currentDir, applicationRoot, moduleRoot }
}

const getFiles = (directoryPath, arrayOfFiles) => {
    const files = fs.readdirSync(directoryPath)
    arrayOfFiles = arrayOfFiles || []
    files.forEach(function (file) {
        if (fs.statSync(directoryPath + '/' + file).isDirectory()) {
            arrayOfFiles = getFiles(directoryPath + '/' + file, arrayOfFiles)
        } else {
            arrayOfFiles.push(path.join('', directoryPath, '/', file))
            return
        }
    })
    return arrayOfFiles
}

const copyFile = (sourcePath, destinationPath) => {
    return new Promise((resolve, reject) => {
        const srcPath = sourcePath
        const distPath = destinationPath
        if (srcPath == distPath) {
            resolve()
            return
        }
        if (!fs.existsSync(distPath)) {
            fs.mkdir(path.dirname(distPath), { recursive: true }, (err) => {
                if (err) reject(err)
                fs.copyFile(srcPath, distPath, (err) => {
                    if (err) reject(err)
                    logger.info(`Created ${srcPath.replace(path.dirname(srcPath), '')}`)
                    resolve()
                })
            })
        }
        resolve()
    })
}

const copyFiles = (sourcePath, destinationPath, { ignore }) => {
    return new Promise((resolve, reject) => {
        const srcPublicPath = sourcePath
        const distPublicPath = destinationPath
        if (srcPublicPath == distPublicPath) {
            resolve()
            return
        }

        var files = getFiles(srcPublicPath)

        if (ignore) {
            files = files.filter(file => !extname(file).includes(ignore))
        } 

        for (var index = 0; index < files.length; index++) {
            const srcFilePath = files[index]
            const distFilePath = srcFilePath.replace(srcPublicPath, distPublicPath)
            if (!fs.existsSync(distFilePath)) {
                fs.mkdir(path.dirname(distFilePath), { recursive: true }, (err) => {
                    if (err) reject(err)
                    fs.copyFile(srcFilePath, distFilePath, (err) => {
                        if (err) reject(err)
                        logger.info(`Created ${srcFilePath.replace(srcPublicPath, '')}`)
                        resolve()
                    })
                })
            }
            resolve()
        }
    })
}

const rmDir = (destinationPath) => {
    fs.rmSync(destinationPath, { recursive: true, force: true })
}

module.exports = {
    paths: paths(),
    getFiles,
    copyFile,
    copyFiles,
    rmDir,
    logger,
}
