import fs from 'fs'
import { join, dirname } from 'path'
import { renderToString } from 'react-dom/server'

import { copyFiles, paths, rmDir } from './modules/common'
import PostCSS from './modules/postcss'
import ESbuild from './modules/esbuild'
import { generate, requireHot } from './modules/pages'

const source = join(paths.applicationRoot, './src')
const destination = join(paths.applicationRoot, './dist')

const init = () => {
    var promises = []
    rmDir(destination)
    ESbuild(`${source}/client`, `${destination}/client`)
    PostCSS(`${source}/public`, destination)
    copyFiles(`${source}/public`, destination, { ignore: ['.css'] })
    generate(`${source}/server/pages`).then((pages) => {
        pages
            .filter((page) => page.url.indexOf(':') == -1)
            .forEach(async (page) => {
                promises.push(
                    new Promise(async (resolve, reject) => {
                        var { file, url, params } = page
                        console.log(`Rendering: ${url}`)
                        var body = ''
                        url = url == '/' ? '/index' : url
                        url = url.endsWith('/') ? url.slice(0, -1) : url

                        const module = requireHot(file)
                        var properties = {}
                        if (module.pageProperties) properties = await module.pageProperties(params)
                        if (module.default) {
                            body = renderToString(module.default({ params, props: properties }))
                        }

                        const fileName = url == '/' ? `${destination}/index.html` : `${destination}${url}.html`
                        fs.mkdir(dirname(fileName), { recursive: true }, (err) => {
                            if (err) return reject(err)
                            fs.writeFile(fileName, body, (err) => {
                                if (err) return reject(err)
                            })
                        })

                        if (params.localizedUrl) {
                            const localizedFileName =
                                url == `/${params.locale}`
                                    ? `${destination}/localized-files/${params.locale}/index.html`
                                    : `${destination}/localized-files${url}.html`

                            fs.mkdir(dirname(localizedFileName), { recursive: true }, (err) => {
                                if (err) return reject(err)
                                fs.writeFile(localizedFileName, body, (err) => {
                                    if (err) return reject(err)
                                    resolve()
                                })
                            })
                        }
                    })
                )
            })

        Promise.all(promises, () => {})
    })
}

export default init()
