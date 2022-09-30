require('./modules/babel')
const fs = require('fs')
const path = require('path')
const helpers = require('./modules/helpers')
const ReactDOMServer = require('react-dom/server')
const express = require('express')
const { fstat } = require('fs')
const app = express()
const port = 3000

const source = path.join(helpers.paths.applicationRoot, './src')
const destination = path.join(helpers.paths.applicationRoot, './.cache')

const cleanup = require('./modules/cleanup')
const postCSS = require('./modules/postcss')
const assets = require('./modules/publicDir')
const pagesComposer = require('./modules/pages')

cleanup.execute(destination)
postCSS.buildCss(source, destination)
assets.copyFiles(source, destination)

// Setup Websockets
const WebSocketServer = require('ws').WebSocketServer
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
app.use(express.static(destination))
app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})

const init = () => {
    pagesComposer
        .generate(source, false)
        .then((pages) => {
            router = express.Router()
            pages.forEach((page) => {
                var { file, url, params } = page
                router.get(url, async (req, res) => {
                    params = { ...params, ...req.params }
                    const module = await pagesComposer.requireHot(file)
                    var properties = {}
                    if (module.pageProperties) properties = await module.pageProperties(params)
                    if (module.default) {
                        res.send(ReactDOMServer.renderToString(module.default({ ...params, ...properties })))
                    } else {
                        console.log('Page does not have a default export')
                        res.send('')
                    }
                })
            })
        })
        .catch((err) => console.log(err))
}

// Watch for changes
fs.watch(`${helpers.paths.applicationRoot}/src`, { recursive: true }, async (eventType, filename) => {
    console.log('Re-Building assets because:', eventType, filename)
    if (eventType !== 'change') await init()
    if (['.css'].includes(path.extname(filename))) await postCSS.buildCss(source, destination)
    if (filename.indexOf('public') > -1) await assets.copyFiles(source, destination)
    if (websocket) websocket.send('reload')
})

module.exports = init()
