import esbuild from 'esbuild'

export default async (source, destination ) => {
    return esbuild.build({
        entryPoints: [`${source}/index.js`],
        bundle: true,
        minify: true,
        outfile: `${destination}/bundle.js`,
    })
}
