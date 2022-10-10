import fs from 'fs'
import { join, dirname } from 'path'
import { renderToString } from 'react-dom/server'

import config from './config'
import { copyFiles, rmDir } from './modules/common'
import paths from './modules/paths'
import logger from './modules/logger.js'
import PostCSS from './modules/postcss'
import ESbuild from './modules/esbuild'
import { generate, requireHot } from './modules/pages'

const source = join(paths.applicationRoot, './src')
const destination = join(paths.applicationRoot, `./${config.output}`)

const init = async () => {
    var promises = []

    try {
        logger.debug('Rebuilding .cache')
        rmDir(destination)
        logger.debug('Generate client scripts')
        await ESbuild(`${source}/client`, `${destination}/client`)
        logger.debug('Generate styles')
        await PostCSS(`${source}/public`, destination)
        logger.debug('Copy assets')
        await copyFiles(`${source}/public`, destination, { ignore: ['.css'] })
    } catch (err) {
        logger.warn(err)
    }

    const pages = await generate(`${source}/server/pages`)
    pages
        .filter((page) => page.url.indexOf(':') == -1)
        .forEach(async (page) => {
            promises.push(
                new Promise(async (resolve, reject) => {
                    var { file, url, params } = page

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
                            logger.info(`Rendered: ${fileName}`)
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
                                logger.info(`Rendered: ${localizedFileName}`)
                            })
                        })
                    }
                    resolve()
                })
            )
        })

    promises.push(
        new Promise((resolve, reject) => {
            const sitemap = pages
                .filter((page) => page.url.indexOf(':') == -1)
                .map((page) => `${config.baseURL}${page.url}`)
                .join('\n')

            fs.writeFile(`${destination}/sitemap.txt`, sitemap, (err) => {
                if (err) {
                    logger.error(err.stack)
                    return reject(err)
                }
                logger.info(`Rendered: ${destination}/sitemap.txt`)
                resolve()
            })
        })
    )
    Promise.all(promises)
        .then((res) => {})
        .catch((err) => logger.err(err))
}

export default init()
