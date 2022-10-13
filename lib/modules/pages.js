import path, { extname } from 'path';
import { existsSync } from 'fs';
import { transformFileSync } from '@babel/core';
import config from '../config';
import { getFiles } from './common';
import { moduleRoot } from './paths';

const { defaultLocale, defaultLocales } = config;

export const requireHot = (file) => {
  try {
    let fileExt = '';
    if (extname(file) === '') {
      if (existsSync(`${file}.jsx`)) fileExt = '.jsx';
      if (existsSync(`${file}.js`)) fileExt = '.js';
    }

    const transpiledCode = transformFileSync(`${file}${fileExt}`, {
      configFile: `${moduleRoot}/lib/config/babel.config.json`,
    });
    // eslint-disable-next-line no-new-func
    const hotModule = new Function('require', 'module', 'exports', transpiledCode.code);
    const relativeRequire = (requiredFile) => {
      if (requiredFile.charAt(0) === '.') {
        return requireHot(path.resolve(path.dirname(file), requiredFile));
      }
      // eslint-disable-next-line import/no-dynamic-require, global-require
      return require(requiredFile);
    };
    const mod = { exports: {} };
    const exports = {};
    hotModule(relativeRequire, mod, exports);
    return exports;
  } catch (err) {
    return new Error(err);
  }
};

const getPages = (sourcePath) =>
  getFiles(sourcePath).map((filePath) => {
    const rawUrlPath = filePath.replace(`${sourcePath}/`, '').replace(path.parse(filePath).ext, '');
    const urlPath = rawUrlPath.replace(/(\[(.*?)\])/g, ':$2').replace(/(index|\/index)/g, '');
    return {
      filePath,
      urlPath: `/${urlPath}`,
      module: requireHot(filePath),
    };
  });

const getLocales = async (module) => {
  if (typeof module.locales === 'undefined') return defaultLocales;
  const result = await module.locales();
  return result;
};

const loadstaticPathParamsFor = async (locale, func) => {
  const pathProperties = await func({ defaultLocale, locale });
  return {
    locale,
    pathProperties,
  };
};

const getstaticPathParams = async (module, locales) => {
  if (typeof module.staticPathParams === 'undefined') return [];
  const results = [];
  for (let i = 0; i < locales.length; i += 1) {
    results.push(loadstaticPathParamsFor(locales[i], module.staticPathParams));
  }
  const localizedstaticPathParams = await Promise.all(results);

  const mapped = {};
  localizedstaticPathParams.forEach((item) => {
    mapped[item.locale] = item.pathProperties;
  });
  return mapped;
};

const getPathPropertyUrl = (url, pathProperties) => {
  let pathPropertyUrl = url;
  const pathPropertieKeys = Object.keys(pathProperties);
  pathPropertieKeys.forEach((key) => {
    pathPropertyUrl = pathPropertyUrl.replace(`:${key}`, pathProperties[key]);
  });
  return pathPropertyUrl;
};

// blog
// blog/:articles
// en/blog
// en/blog/:articles

const preparePageWithoutProperties = (page) => {
  if (page.urlPath.includes(':') || Object.keys(page.staticPathParams) === 0) return null;
  const paths = [];
  paths.push({
    filePath: page.filePath,
    urlPath: page.urlPath,
    localizedUrl: false,
    localization: {
      defaultLocale,
      locale: defaultLocale,
      locales: page.locales,
      path: page.urlPath,
      basePath: page.urlPath,
    },
    pathParams: {},
  });

  page.locales.forEach((locale) => {
    const localizedPath = `/${locale}${page.urlPath}`;
    paths.push({
      filePath: page.filePath,
      urlPath: localizedPath,
      localizedUrl: true,
      localization: {
        defaultLocale,
        locale,
        locales: page.locales,
        path: localizedPath,
        basePath: page.urlPath,
      },
      pathParams: {},
    });
  });

  return paths;
};

const prepareDynamicPageWithProperties = (page) => {
  if (!page.urlPath.includes(':')) return null;
  const paths = [];

  page.staticPathParams[defaultLocale].forEach((pathProperties) => {
    const pathWithProperties = getPathPropertyUrl(page.urlPath, pathProperties);
    paths.push({
      filePath: page.filePath,
      urlPath: pathWithProperties,
      localizedUrl: false,
      localization: {
        defaultLocale,
        locale: defaultLocale,
        locales: page.locales,
        path: pathWithProperties,
        basePath: pathWithProperties,
      },
      pathParams: pathProperties,
    });
  });

  page.locales.forEach((locale) => {
    page.staticPathParams[locale].forEach((pathProperties) => {
      const localizedPath = `/${locale}${getPathPropertyUrl(page.urlPath, pathProperties)}`;
      const pathWithProperties = getPathPropertyUrl(page.urlPath, pathProperties);
      paths.push({
        filePath: page.filePath,
        urlPath: localizedPath,
        localizedUrl: true,
        localization: {
          defaultLocale,
          locale,
          locales: page.locales,
          path: localizedPath,
          basePath: pathWithProperties,
        },
        pathParams: pathProperties,
      });
    });
  });

  return paths;
};

export const generate = async (sourcePath) => {
  const pages = getPages(sourcePath);

  // Load Page locales
  const localesPromises = [];
  for (let i = 0; i < pages.length; i += 1) {
    localesPromises.push(getLocales(pages[i].module));
  }
  let results = await Promise.all(localesPromises);
  results.forEach((result, index) => {
    pages[index].locales = result;
  });

  // Load Static Path properties
  const staticPathParamsPromiseArray = [];
  for (let i = 0; i < pages.length; i += 1) {
    const page = pages[i];
    staticPathParamsPromiseArray.push(getstaticPathParams(page.module, page.locales));
  }
  results = await Promise.all(staticPathParamsPromiseArray);
  results.forEach((result, index) => {
    pages[index].staticPathParams = result;
  });

  let response = [];
  pages.forEach((page) => {
    const pageWithoutProperties = preparePageWithoutProperties(page);
    const dynamicPageWithProperties = prepareDynamicPageWithProperties(page);
    if (pageWithoutProperties) response = [...response, ...pageWithoutProperties];
    if (dynamicPageWithProperties) response = [...response, ...dynamicPageWithProperties];
  });

  return response;
};
