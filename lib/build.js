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
    pages
        .filter((page) => page.path.indexOf(':') == -1)
        .forEach(async (page) => {
            const properties = await pageComposer.properties({
                params: page.params,
                __module: page.__module,
                defaultLocale: page.defaultLocale,
                locale: page.locale,
            })
            const fileName = page.path == '/' ? `${destination}/index.html` : `${destination}${page.path}.html`
            const body = ReactDOMServer.renderToString(page.__module.default(properties))

            fs.mkdir(path.dirname(fileName), { recursive: true }, (err) => {
                if (err) throw err
                fs.writeFile(fileName, body, () => true)
            })

            page.locales.forEach(async (locale) => {
                const localeProperties = await pageComposer.properties({
                    params: locale.params,
                    __module: page.__module,
                    defaultLocale: page.defaultLocale,
                    locale: locale.locale,
                })

                const localeFileName = page.path == '/' ? `${destination}/${locale.locale}/index.html` : `${destination}/${locale.locale}${page.path}.html`
                const localeBody = ReactDOMServer.renderToString(page.__module.default(localeProperties))

                fs.mkdir(path.dirname(localeFileName), { recursive: true }, (err) => {
                    if (err) throw err
                    fs.writeFile(localeFileName, localeBody, (err) => {
                        if (err) throw err
                    })
                })
            })

            page.locales.forEach(async (locale) => {
                const localeProperties = await pageComposer.properties({
                    params: locale.params,
                    __module: page.__module,
                    defaultLocale: page.defaultLocale,
                    locale: locale.locale,
                })

                const localeFileName =
                    page.path == '/'
                        ? `${destination}/localized-files/${locale.locale}/index.html`
                        : `${destination}/localized-files/${locale.locale}${page.path}.html`
                const localeBody = ReactDOMServer.renderToString(page.__module.default(localeProperties))

                fs.mkdir(path.dirname(localeFileName), { recursive: true }, (err) => {
                    if (err) throw err
                    fs.writeFile(localeFileName, localeBody, (err) => {
                        if (err) throw err
                    })
                })
            })
        })
})
