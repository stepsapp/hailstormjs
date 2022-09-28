const path = require('path')
const fs = require('fs')

const config = require('../config')

const getAllFiles = function (dirPath, arrayOfFiles) {
    var files = fs.readdirSync(dirPath)
    arrayOfFiles = arrayOfFiles || []
    files.forEach(function (file) {
        if (fs.statSync(dirPath + '/' + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + '/' + file, arrayOfFiles)
        } else {
            arrayOfFiles.push(path.join('', dirPath, '/', file))
        }
    })
    return arrayOfFiles
}

export const generate = async (sourcePath, localeArray) => {
    sourcePath = `${sourcePath}/pages`
    const pages = getAllFiles(sourcePath).map((filePath) => {
        const rawUrlPath = filePath.replace(`${sourcePath}/`, '').replace(path.parse(filePath).ext, '')
        const urlPath = rawUrlPath.replace(/(\[(.*?)\])/g, ':$2').replace(/(index|\/index)/g, '')
        return {
            filePath,
            urlPath: `${urlPath}`,
        }
    })

    var staticUrls = []
    for (var i = 0; i < pages.length; i++) {
        const page = pages[i]
        const fileImport = require(page.filePath)

        var defaultLocale = typeof config.defaultLocale !== 'undefined' ? config.defaultLocale : 'en'
        var locales = typeof config.locales !== 'undefined' ? config.locales : ['en']
        var urls = [{ url: page.urlPath, params: {} }]
        var pageStaticPathProperties = typeof fileImport.pageStaticPathProperties == 'function' ? await fileImport.pageStaticPathProperties() : {}
        if (typeof fileImport.pageLocales == 'function') locales = await fileImport.pageLocales()

        // Generate URLS
        if (pageStaticPathProperties.length > 0) {
            const pagePathArray = page.urlPath.split('/')
            urls = pageStaticPathProperties.map((pageStaticPathParams) => {
                const pagePath = pagePathArray
                    .map((segment) => {
                        if (segment.indexOf(':') != -1) {
                            return pageStaticPathParams[segment.substring(1)]
                        }
                        return segment
                    })
                    .join('/')

                return {
                    url: pagePath,
                    params: pageStaticPathParams,
                }
            })
        }
        if (localeArray) {
            urls.forEach((url) => {
                staticUrls.push({
                    path: `/${url.url}`,
                    locale: defaultLocale,
                    defaultLocale: defaultLocale,
                    params: url.params,
                    __module: fileImport,
                    locales: locales.map((locale) => {
                        return {
                            locale: locale,
                            params: url.params,
                        }
                    }),
                })
            })
        } else {
            urls.forEach(async (url) => {
                staticUrls.push({
                    path: `/${url.url}`,
                    locale: defaultLocale,
                    defaultLocale: defaultLocale,
                    params: url.params,
                    __module: fileImport,
                })
                locales.forEach(async (locale) => {
                    staticUrls.push({
                        path: `/${locale}/${url.url}`,
                        locale: locale,
                        defaultLocale: defaultLocale,
                        params: url.params,
                        __module: fileImport,
                    })
                })
            })
        }
    }
    return staticUrls
}

export const properties = async ({ params, __module, defaultLocale, locale }) => {
    var properties = {
        params: {},
    }

    if (defaultLocale) properties['defaultLocale'] = defaultLocale
    if (locale) properties['locale'] = locale
    if (params) properties['params'] = params

    if (typeof __module.pageProperties == 'function') {
        const pageProperties = await __module.pageProperties(properties)
        properties = { ...properties, ...pageProperties }
    }
    return properties
}
