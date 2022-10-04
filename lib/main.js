import { join, extname } from 'path'
import { watch } from 'chokidar'
import { renderToString } from 'react-dom/server'
import express, { static as staticFileServe, Router } from 'express'
const app = express()
const port = 3000

import BuildClientScripts from './modules/client'
import { paths } from './modules/helpers'
const source = join(paths.applicationRoot, './src')
const destination = join(paths.applicationRoot, './.cache')

import { execute } from './modules/cleanup'
import { buildCss } from './modules/postcss'
import { copyFiles } from './modules/publicDir'
import { generate, requireHot } from './modules/pages'

execute(destination)
buildCss(source, destination)
copyFiles(source, destination)

// Setup Websockets
import { WebSocketServer } from 'ws'
const wss = new WebSocketServer({ port: 3080 })
var websocket = null
wss.on('connection', function connection(ws) {
    websocket = ws
})

// Express Setup
var router = undefined
app.use(function (req, res, next) {
    // this needs to be a function to hook on whatever the current router is
    router(req, res, next)
})
app.use(staticFileServe(destination))
app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})

const init = () => {
    BuildClientScripts({ source: `${source}/client` })
    generate(source, false)
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
        })
        .catch((err) => console.log(err))
}

watch(`${paths.applicationRoot}/src`).on('all', async (eventType, filename) => {
    if (eventType !== 'change') return
    console.log('Re-Building assets because:', eventType, filename)
    init()
    if (['.css'].includes(extname(filename))) await buildCss(source, destination)
    if (filename.indexOf('public') > -1) await copyFiles(source, destination)
    if (websocket) websocket.send('reload')
})


export default init()
