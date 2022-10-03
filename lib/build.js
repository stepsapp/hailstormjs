require('./modules/babel')
const fs = require('fs')
const path = require('path')
const helpers = require('./modules/helpers')

const source = path.join(helpers.paths.applicationRoot, './src')
const destination = path.join(helpers.paths.applicationRoot, './dist')

require('./modules/cleanup').execute(destination)
require('./modules/postcss').buildCss(source, destination)
require('./modules/publicDir').copyFiles(source, destination)

const pageComposer = require('./modules/pages')
const ReactDOMServer = require('react-dom/server')

module.exports = pageComposer.generate(source, true).then((pages) => {
    var promises = []
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

                    const module = await pageComposer.requireHot(file)
                    var properties = {}
                    if (module.pageProperties) properties = await module.pageProperties(params)
                    if (module.default) {
                        body = ReactDOMServer.renderToString(module.default({ params, props: properties }))
                    }

                    const fileName = url == '/' ? `${destination}/index.html` : `${destination}${url}.html`
                    fs.mkdir(path.dirname(fileName), { recursive: true }, (err) => {
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

                        fs.mkdir(path.dirname(localizedFileName), { recursive: true }, (err) => {
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
