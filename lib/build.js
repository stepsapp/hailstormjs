import fs from 'fs';
import { join, dirname } from 'path';
import { renderToString } from 'react-dom/server';
import { I18n } from 'i18n';

import config from './config';
import { copyFiles, rmDir } from './modules/common';
import paths from './modules/paths';
import logger from './modules/logger';
import PostCSS from './modules/postcss';
import ESbuild from './modules/esbuild';
import { generate, requireHot } from './modules/pages';

const source = join(paths.applicationRoot, './src');
const destination = join(paths.applicationRoot, `./${config.output}`);

const build = async () => {
  logger.debug('Rebuilding .cache');
  rmDir(destination);
  logger.debug('Generate client scripts');
  await ESbuild(`${source}/client`, `${destination}/client`);
  logger.debug('Generate styles');
  await PostCSS(`${source}/public`, destination);
  logger.debug('Copy assets');
  copyFiles(`${source}/public`, destination, { ignore: ['.css'] });

  const pages = await generate(`${source}/server/pages`);

  const getProperties = async (index, module, pathParams, localization) => {
    const moduleProperties = await module.properties({ pathParams, localization });
    return { index, properties: moduleProperties };
  };

  const propertiesPromiseArray = [];
  for (let i = 0; i < pages.length; i += 1) {
    const page = pages[i];
    const { filePath, localization, pathParams } = page;
    const module = requireHot(filePath);
    if (typeof module.properties !== 'undefined') propertiesPromiseArray.push(getProperties(i, module, pathParams, localization));
  }

  const results = await Promise.allSettled(propertiesPromiseArray);
  results.forEach((result) => {
    pages[result.value.index].properties = result.value.properties || {};
  });

  pages
    .filter((page) => page.urlPath.indexOf(':') === -1)
    .forEach((page) => {
      try {
        // eslint-disable-next-line object-curly-newline
        const { filePath, urlPath, localization, pathParams, localizedUrl, properties } = page;

        const module = requireHot(filePath);
        if (module.constructor.name === 'Error') throw module;
        if (typeof module.default === 'undefined') throw new Error('No default export defined');

        let body = '';
        let url = '';
        url = urlPath === '/' ? '/index' : urlPath;
        url = url.endsWith('/') ? url.slice(0, -1) : url;

        const i18n = new I18n();
        i18n.configure({
          locales: localization.locales,
          directory: `${paths.applicationRoot}/src/i18n`,
        });
        i18n.setLocale(localization.locale);

        const component = module.default({
          path: urlPath,
          pathParams,
          localization,
          properties,
          i18n,
        });

        body = renderToString(component);
        body = `<!DOCTYPE html>${body}`;

        const fileName = url === '/' ? `${destination}/index.html` : `${destination}${url}.html`;
        fs.mkdirSync(dirname(fileName), { recursive: true });
        fs.writeFileSync(fileName, body);
        logger.info(`Rendered: ${fileName}`);

        if (localizedUrl) {
          const localizedFileName = url === `/${localization.locale}` ? `${destination}/localized-files/${localization.locale}/index.html` : `${destination}/localized-files${url}.html`;
          fs.mkdirSync(dirname(localizedFileName), { recursive: true });
          fs.writeFileSync(localizedFileName, body);
          logger.info(`Rendered: ${localizedFileName}`);
        }
      } catch (err) {
        logger.err(err);
      }
    });

  const sitemap = pages
    .filter((page) => page.urlPath.indexOf(':') === -1)
    .map((page) => `${config.baseURL}${page.urlPath}`)
    .join('\n');

  try {
    fs.writeFileSync(`${destination}/sitemap.txt`, sitemap);
    logger.info(`Rendered: ${destination}/sitemap.txt`);
  } catch (err) {
    logger.err(err);
  }

  logger.debug('Done');
};

export default build;
