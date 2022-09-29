require('./modules/babel')
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
const app = express()
const port = 3000

module.exports = pagesComposer.generate(source, false).then((pages) => {
    pages.forEach((page) => {
        app.get(page.path, async (req, res) => {
            const properties = await pagesComposer.properties({
                params: { ...page.params, ...req.params },
                __module: page.__module,
                defaultLocale: page.defaultLocale,
                locale: page.locale,
            })
            res.send(ReactDOMServer.renderToString(page.__module.default(properties)))
        })
    })
    app.get('/sitemap.json', async (req, res) => {
        res.send(
            pages.map((page) => {
                return page.path
            })
        )
    })

    app.use(express.static(destination))

    app.listen(port, () => {
        console.log(`App listening on port ${port}`)
    })
})
