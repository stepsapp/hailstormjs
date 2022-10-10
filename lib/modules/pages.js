import { getFiles } from './common'
import logger from './logger'
import paths from './paths'
const path = require('path')
const fs = require('fs')
const babel = require('@babel/core')
const config = require('../config')

export const generate = async (sourcePath) => {
    const defaultLocale = typeof config.defaultLocale !== 'undefined' ? config.defaultLocale : 'en'
    const defaultLocales = typeof config.locales !== 'undefined' ? config.locales : ['en']
    const pages = getFiles(sourcePath).map((filePath) => {
        const rawUrlPath = filePath.replace(`${sourcePath}/`, '').replace(path.parse(filePath).ext, '')
        const urlPath = rawUrlPath.replace(/(\[(.*?)\])/g, ':$2').replace(/(index|\/index)/g, '')
        return {
            filePath,
            urlPath: `/${urlPath}`,
        }
    })

    var promises = []
    var urls = []
    for (var i = 0; i < pages.length; i++) {
        const page = pages[i]
        promises.push(
            new Promise(async (resolve, reject) => {
                try {
                    const pageUrls = []
                    const module = requireHot(page.filePath)
                    
                    var locales = typeof module.pageLocales != 'undefined' ? await module.pageLocales() : defaultLocales

                    if (typeof module.pageStaticPathProperties != 'undefined') {
                        var pageStaticPathPropertiePromises = []
                        for (var i = 0; i < locales.length; i++) {
                            pageStaticPathPropertiePromises.push(
                                new Promise(async (resolve, reject) => {
                                    const locale = locales[i]
                                    const urls = []
                                    const staticPathProperties = await module.pageStaticPathProperties({ defaultLocale, locale })
                                    staticPathProperties.map((pathProperties) => {
                                        var url = `${page.urlPath}`
                                        const pathPropertieKeys = Object.keys(pathProperties)
                                        pathPropertieKeys.forEach((key) => (url = url.replace(`:${key}`, pathProperties[key])))
                                        if (locale == defaultLocale) {
                                            urls.push({
                                                file: page.filePath,
                                                url,
                                                params: {
                                                    ...pathProperties,
                                                    localizedUrl: false,
                                                    locale: defaultLocale,
                                                    defaultLocale,
                                                },
                                            })
                                        }
                                        urls.push({
                                            file: page.filePath,
                                            url: `/${locale}${url}`,
                                            params: {
                                                ...pathProperties,
                                                localizedUrl: true,
                                                locale,
                                                defaultLocale,
                                            },
                                        })
                                    })
                                    resolve(urls)
                                })
                            )
                        }
                        await Promise.all(pageStaticPathPropertiePromises).then((results) => {
                            results.forEach((result) => result.forEach((url) => pageUrls.push(url)))
                        })
                    } else {
                        pageUrls.push({
                            file: page.filePath,
                            url: `${page.urlPath}`,
                            params: {
                                localizedUrl: false,
                                locale: defaultLocale,
                                defaultLocale,
                            },
                        })
                        for (var i = 0; i < locales.length; i++) {
                            const locale = locales[i]
                            pageUrls.push({
                                file: page.filePath,
                                url: `/${locale}${page.urlPath}`,
                                params: {
                                    localizedUrl: true,
                                    locale,
                                    defaultLocale,
                                },
                            })
                        }
                    }
                    resolve(pageUrls)
                } catch (err) {
                    logger.error(err.stack)
                }
            })
        )
    }

    await Promise.all(promises).then((results) => {
        results.forEach((result) => result.forEach((url) => urls.push(url)))
    })
    return urls
}

export const requireHot = (file) => {
    try {
        var code = fs.readFileSync(file)
        var transpiledCode = babel.transformSync(code, { configFile: `${paths.moduleRoot}/lib/config/babel.config.json` })
        const hotModule = new Function('require', 'module', 'exports', transpiledCode.code)
        const relative_require = (requiredFile) => {
            if (requiredFile.charAt(0) === '.') {
                return requireHot(path.resolve(path.dirname(file), requiredFile))
            }
            return require(requiredFile)
        }
        var mod = { exports: {} }
        var exports = {}
        hotModule(relative_require, mod, exports)
        return exports
    } catch (err) {
        return new Error(err)
    }
}
