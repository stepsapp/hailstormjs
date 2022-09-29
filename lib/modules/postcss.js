const fs = require('fs')
const path = require('path')
const autoprefixer = require('autoprefixer')
const tailwind = require('tailwindcss')
const postcss = require('postcss')

const getCssFiles = (directoryPath, arrayOfFiles) => {
    const files = fs.readdirSync(directoryPath)
    arrayOfFiles = arrayOfFiles || []
    files.forEach(function (file) {
        if (fs.statSync(directoryPath + '/' + file).isDirectory()) {
            arrayOfFiles = getCssFiles(directoryPath + '/' + file, arrayOfFiles)
        } else {
            const fileExtension = path.extname(file)
            if (fileExtension === '.css') {
                arrayOfFiles.push(path.join('', directoryPath, '/', file))
            }
            return
        }
    })
    return arrayOfFiles
}

export const buildCss = (sourcePath, destinationPath) => {
    const srcPublicPath = `${sourcePath}/public`
    const distPublicPath = destinationPath
    const cssFiles = getCssFiles(srcPublicPath)
    for (var index = 0; index < cssFiles.length; index++) {
        const srcFilePath = cssFiles[index]
        const distFilePath = srcFilePath.replace(srcPublicPath, distPublicPath)

        fs.mkdir(path.dirname(distFilePath), { recursive: true }, (err) => {
            if (err) throw err
            fs.readFile(srcFilePath, (err, css) => {
                postcss([autoprefixer, tailwind])
                    .process(css, { from: srcFilePath, to: distFilePath })
                    .then((result) => {
                        fs.writeFile(distFilePath, result.css, () => true)
                    })
                    .catch((err) => {
                        console.log(err)
                    })
            })
        })
    }
}
