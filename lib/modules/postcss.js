import fs from 'fs'
import { dirname, extname } from 'path'
import autoprefixer from 'autoprefixer'
import tailwind from 'tailwindcss'
import postcss from 'postcss'
import { getFiles } from './common'

export default (sourcePath, destinationPath) => {
    return new Promise((resolve, reject) => {
        const cssFiles = getFiles(sourcePath).filter(file => extname(file) == '.css')
        for (var index = 0; index < cssFiles.length; index++) {
            const srcFilePath = cssFiles[index]
            const distFilePath = srcFilePath.replace(sourcePath, destinationPath)

            fs.mkdir(dirname(distFilePath), { recursive: true }, (err) => {
                if (err) throw err
                fs.readFile(srcFilePath, (err, css) => {
                    postcss([autoprefixer, tailwind])
                        .process(css, { from: srcFilePath, to: distFilePath })
                        .then((result) => {
                            fs.writeFile(distFilePath, result.css, () => true)
                            resolve()
                        })
                        .catch((err) => {
                            console.log(err)
                            reject()
                        })
                })
            })
        }
    })
}
