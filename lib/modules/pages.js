import path, { extname } from 'path';
import { existsSync } from 'fs';
import { transformFileSync } from '@babel/core';
import config from '../config';
import { getFiles } from './common';
import { moduleRoot } from './paths';

export const { defaultLocale, defaultLocales } = config;

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

const getPages = (sourcePath, withoutLocalization = false) => {
  const result = [];
  getFiles(sourcePath).forEach((filePath) => {
    const rawUrlPath = filePath.replace(`${sourcePath}/`, '').replace(path.parse(filePath).ext, '');
    const urlPath = rawUrlPath.replace(/(\[(.*?)\])/g, ':$2').replace(/(index|\/index)/g, '');
    const pageObject = {
      filePath,
      urlPath: `/${urlPath}`,
      urlBasePath: `/${urlPath}`,
      localization: {
        locales: defaultLocales,
        locale: defaultLocale,
      },
    };
    if (withoutLocalization) {
      delete pageObject.localization;
      delete pageObject.urlBasePath;
    }

    result.push(pageObject);
    if (!withoutLocalization) {
      defaultLocales.forEach((locale) => {
        result.push({
          filePath,
          urlPath: `/${locale}/${urlPath}`,
          urlBasePath: `/${urlPath}`,
          localization: {
            locales: defaultLocales,
            locale,
          },
        });
      });
    }
  });
  return result;
};

export const getstaticPathParams = async (module, locale) => {
  const items = [];
  if (typeof module.staticPathParams === 'undefined') {
    items.push({ localization: { locales: defaultLocales, locale }, pathParams: {} });
  } else {
    const staticPathParams = await module.staticPathParams({ defaultLocale, locale });
    staticPathParams.forEach((item) => {
      items.push({ localization: { locales: defaultLocales, locale }, pathParams: item });
    });
  }
  return items;
};

export const getProperties = async (module, localization, pathParams) => {
  if (typeof module.properties === 'undefined') return {};
  const data = await module.properties({ pathParams, localization });
  return data;
};

export const getPathPropertyUrl = (url, pathParams) => {
  let pathPropertyUrl = url;
  const pathPropertieKeys = Object.keys(pathParams);
  pathPropertieKeys.forEach((key) => {
    pathPropertyUrl = pathPropertyUrl.replace(`:${key}`, pathParams[key]);
  });
  return pathPropertyUrl;
};

export const normalizeUrl = (string) => {
  let url = string;
  url = url === '/' ? '/index' : url;
  url = url.endsWith('/') ? url.slice(0, -1) : url;
  return url;
};

export const prepareLocalizationObject = (localizationObject, baseUrl, localizedUrl) => {
  const localization = localizationObject;
  localization.path = localizedUrl;
  localization.basePath = baseUrl;
  return localization;
};


export const generate = async (sourcePath, withoutLocalization) => {
  const pages = getPages(sourcePath, withoutLocalization);
  return pages;
};
