const fs = require('fs')
const path = require('path')

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

export const copyFiles = (sourcePath, destinationPath) => {
    return new Promise((resolve, reject) => {
        const srcPublicPath = sourcePath
        const distPublicPath = destinationPath
        if (srcPublicPath == distPublicPath) resolve
        const files = getFiles(srcPublicPath)
        for (var index = 0; index < files.length; index++) {
            const srcFilePath = files[index]
            const distFilePath = srcFilePath.replace(srcPublicPath, distPublicPath)
            if (!fs.existsSync(distFilePath)) {
                console.log(`Created ${srcFilePath.replace(srcPublicPath, '')}`)
                fs.mkdir(path.dirname(distFilePath), { recursive: true }, (err) => {
                    if (err) reject(err)
                    fs.copyFile(srcFilePath, distFilePath, (err) => {
                        if (err) reject(err)
                        resolve()
                    })
                })
            }
        }
    })
}
