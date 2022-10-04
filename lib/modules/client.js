import { Parcel } from '@parcel/core'
const path = require('path')
const fs = require('fs')

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

export const build = async ({source, destination}) => {
    const files = getFiles(source)

    const bundler = new Parcel({
        entries: files,
        defaultConfig: '@parcel/config-default',
    })

    try {
        let { bundleGraph, buildTime } = await bundler.run()
        let bundles = bundleGraph.getBundles()
        console.log(`✨ Built ${bundles.length} bundles in ${buildTime}ms!`)
    } catch (err) {
        console.log(err.diagnostics)
    }
}
 
export default build