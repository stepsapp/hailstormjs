import esbuild from 'esbuild'
import fs from 'fs'

export default async (source, destination ) => {
    if (!fs.existsSync(`${source}/index.jsx`)) return false
    return esbuild.build({
        entryPoints: [`${source}/index.jsx`],
        bundle: true,
        minify: true,
        outfile: `${destination}/bundle.js`,
    })
}
