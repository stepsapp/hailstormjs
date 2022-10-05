import { join } from 'path'
import { watch } from 'chokidar'
import { renderToString } from 'react-dom/server'
import express, { static as staticFileServe, Router } from 'express'
import { WebSocketServer } from 'ws'

import { copyFiles, paths, rmDir, logger } from './modules/common'
import PostCSS from './modules/postcss'
import ESbuild from './modules/esbuild'
import { generate, requireHot } from './modules/pages'

const wss = new WebSocketServer({ port: 3080 })
const source = join(paths.applicationRoot, './src')
const destination = join(paths.applicationRoot, './.cache')
const app = express()
const port = 3000

// Setup Websockets
var websocket = null
wss.on('connection', function connection(ws) {
    websocket = ws
})

// Setup Express
var router = undefined
app.use((req, res, next) => router(req, res, next))
app.use(staticFileServe(destination))
app.listen(port, () => {})

const init = () => {
    logger.info('Remove files from .cache')
    rmDir(destination)
    logger.info('Generate client scripts')
    ESbuild(`${source}/client`, `${destination}/client`)
    logger.info('Generate styles')
    PostCSS(`${source}/public`, destination)
    logger.info('Copy assets')
    copyFiles(`${source}/public`, destination, { ignore: ['.css'] })
    logger.info('Generate paths and do some magic')
    generate(`${source}/server/pages`)
        .then((pages) => {
            router = Router()
            pages.forEach((page) => {
                var { file, url, params } = page
                router.get(url, async (req, res) => {
                    params = { ...params, ...req.params }
                    const module = await requireHot(file)
                    var properties = {}
                    if (module.pageProperties) properties = await module.pageProperties(params)
                    if (module.default) {
                        res.send(renderToString(module.default({ params, props: properties })))
                    } else {
                        console.log('Page does not have a default export')
                        res.send('')
                    }
                })
            })
            logger.info(`Page available on http://localhost:${port}`)
        })
        .catch((err) => console.log(err))
}

watch(`${paths.applicationRoot}/src`).on('all', async (eventType, filename) => {
    if (eventType !== 'change') return
    logger.info(`Re-Building assets because: ${eventType} ${filename}`)
    init()
    if (websocket) websocket.send('reload')
})

export default init()
