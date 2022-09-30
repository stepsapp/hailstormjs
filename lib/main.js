require('./modules/babel')
const fs = require('fs')
const path = require('path')
const helpers = require('./modules/helpers')

const source = path.join(helpers.paths.applicationRoot, './src')
const destination = path.join(helpers.paths.applicationRoot, './.cache')

require('./modules/cleanup').execute(destination)
require('./modules/postcss').buildCss(source, destination)
require('./modules/publicDir').copyFiles(source, destination)

const pagesComposer = require('./modules/pages')

const ReactDOMServer = require('react-dom/server')
const express = require('express')
const { fstat } = require('fs')
const app = express()
const port = 3000

const WebSocketServer = require('ws').WebSocketServer
const wss = new WebSocketServer({ port: 3080 })
var websocket = null

wss.on('connection', function connection(ws) {
    websocket = ws
})


fs.watch(`${helpers.paths.applicationRoot}/src`, { recursive: true }, (eventType, filename) => {
    if (websocket) websocket.send('reload')
})

module.exports = pagesComposer.generate(source, false).then((pages) => {
    pages.forEach((page) => {
        var { file, url, params } = page
        app.get(url, async (req, res) => {
            params = { ...params, ...req.params}
            const module = await pagesComposer.requireHot(file)
            var properties = {}
            if (module.pageProperties) properties = await module.pageProperties(params)
            properties = { ...params, ...properties }
            res.send(ReactDOMServer.renderToString(module.default(properties)))
        })
    }) 

    app.use(express.static(destination))

    app.listen(port, () => {
        console.log(`App listening on port ${port}`)
    })
}).catch(err => console.log(err))
