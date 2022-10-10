import file from '@babel/core/lib/transformation/file/file.js'
import fs from 'fs'
import path, { extname } from 'path'
import logger from './logger.js'

export const getFiles = (directoryPath, arrayOfFiles) => {
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

export const copyFile = (srcFilePath, distFilePath) => {
    return new Promise((resolve, reject) => {
        try {
            const fileName = path.basename(srcFilePath)
            if (fs.existsSync(distFilePath)) {
                logger.debug(`${fileName} already exists`)
                return
            }
            fs.mkdirSync(path.dirname(distFilePath), { recursive: true })
            fs.copyFileSync(srcFilePath, distFilePath)
            logger.debug(`${fileName} created`)
            resolve()
        } catch (err) {
            reject(err)
        }
    })
}

export const copyFiles = async (sourcePath, destinationPath, options) => {
    var { ignore } = options
    var promises = []

    if (sourcePath == destinationPath) return
    var files = getFiles(sourcePath)
    if (ignore) files = files.filter((file) => !extname(file).includes(ignore))

    files.forEach((srcFilePath) => {
        promises.push(copyFile(srcFilePath, srcFilePath.replace(sourcePath, destinationPath)))
    })

    await Promise.all(promises)
    return
}

export const rmDir = (destinationPath) => {
    try {
        fs.rmSync(destinationPath, { recursive: true, force: true })
    } catch (err) {
        logger.error(err)
    }
}
