import { join } from 'path'
import { watch } from 'chokidar'
import { renderToString } from 'react-dom/server'
import express, { static as staticFileServe, Router } from 'express'
import { WebSocketServer } from 'ws'

import config from './config'
import { copyFiles, rmDir } from './modules/common'
import paths from './modules/paths'
import logger from './modules/logger'
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

const init = async () => {
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
    router = Router()
    const pages = await generate(`${source}/server/pages`)
    pages.forEach((page) => {
        var { file, url, params } = page
        router.get(url, async (req, res) => {
            try {
                params = { ...params, ...req.params }
                const module = requireHot(file)
                if (module.constructor.name === 'Error') throw module
                var properties = {}
            
                if (typeof module.pageProperties !== 'undefined') properties = await module.pageProperties(params)
                if (typeof module.default !== 'undefined') {
                    const render = renderToString(module.default({ params, props: properties }))
                    res.send(render)
                }
                
            } catch (err) {
                if (typeof err.stack != 'undefined') {
                    logger.error(err.stack)
                    return res.send('Something went wront. Check console...')
                } else {
                    logger.error(err)
                    return res.send(err)
                }
            }
        })
    })

    router.get('/sitemap.txt', async (req, res) => {
        res.set('content-type', 'text/plain')
        res.send(pages.map((page) => `${config.baseURL}${page.url}`).join('\n'))
    })

    logger.debug(`Page available on http://localhost:${port}`)
}

watch(`${paths.applicationRoot}/src`).on('all', async (eventType, filename) => {
    if (eventType !== 'change') return
    logger.warn(`Re-Building application because of change in filesystem`)
    init()
    if (websocket) websocket.send('reload')
})

export default init()
