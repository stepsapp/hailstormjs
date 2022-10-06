const path = require('path')
const fs = require('fs')

export default async (source, destination ) => {
    require('esbuild').build({
        entryPoints: [`${source}/index.js`],
        bundle: true,
        minify: true,
        outfile: `${destination}/bundle.js`,
    })
}
