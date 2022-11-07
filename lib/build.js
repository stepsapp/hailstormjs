import fs from 'fs';
import util from 'util';
import { join } from 'path';
import { renderToString } from 'react-dom/server';
import { I18n } from 'i18n';

import config from './config';
import { copyFiles, rmDir, writeFile } from './modules/common';
import paths from './modules/paths';
import logger from './modules/logger';
import PostCSS from './modules/postcss';
import ESbuild from './modules/esbuild';
import {
  generate,
  getstaticPathParams,
  defaultLocales,
  getProperties,
  getPathPropertyUrl,
  defaultLocale,
  normalizeUrl,
  prepareLocalizationObject,
} from './modules/pages';

const source = join(paths.applicationRoot, './src');
const destination = join(paths.applicationRoot, `./${config.output}`);
const i18n = new I18n();
i18n.configure({
  locales: defaultLocales,
  directory: `${paths.applicationRoot}/src/i18n`,
});

const tasks = [];
const sitemap = [];
let pages = [];

const taskModule = async (pageIndex, filePath) => {
  try {
    pages[pageIndex].module = await import(filePath);
  } catch (err) {
    console.log(err);
  }
};

const taskStaticPathParams = async (pageIndex, module, locale) => {
  try {
    if (typeof pages[pageIndex].attributes === 'undefined') pages[pageIndex].attributes = [];
    const result = await getstaticPathParams(module, locale);
    if (result) {
      result.forEach((item) => pages[pageIndex].attributes.push(item));
    }
  } catch (err) {
    console.log(err);
  }
};

const taskGeneratePage = async (page, data) => {
  try {
    i18n.setLocale(data.attributes.localization.locale);

    const properties = await getProperties(
      page.module,
      data.attributes.localization,
      data.attributes.pathParams,
    );

    const componentProperties = {
      path: data.attributes.path,
      pathParams: data.attributes.pathParams,
      localization: data.attributes.localization,
      properties,
      i18n,
    };

    const component = page.module.default(componentProperties);

    let body = renderToString(component);
    body = `<!DOCTYPE html>${body}`;

    writeFile(`${destination}${data.exportPath}`, body);
    logger.info(`Rendered: ${data.exportPath}`);
    if (data.localizedExportPath) {
      writeFile(`${destination}${data.localizedExportPath}`, body);
      logger.info(`Rendered: ${data.localizedExportPath}`);
    }
  } catch (err) {
    console.log(err);
  }
};

const runTask = async (task) => {
  const { type, data } = task;
  const page = pages[data.pageIndex];
  switch (type) {
    case 'module':
      await taskModule(data.pageIndex, page.filePath);
      // eslint-disable-next-line no-use-before-define
      await next();
      break;
    case 'staticPathParams':
      await taskStaticPathParams(data.pageIndex, page.module, data.locale);
      // eslint-disable-next-line no-use-before-define
      await next();
      break;
    case 'generatePage':
      await taskGeneratePage(page, data);
      // eslint-disable-next-line no-use-before-define
      await next();
      break;
    default:
      break;
  }
};

const next = async () => {
  tasks.splice(0, 1);
  if (tasks.length >= 1) {
    await runTask(tasks[0]);
    return false;
  }
  return true;
};

const startTaskRunner = async () => {
  await runTask(tasks[0]);
};

const build = async () => {
  logger.info('Start build process');
  await rmDir(destination);

  logger.info('Generate client scripts');
  await ESbuild(`${source}/client`, `${destination}/client`);

  logger.info('Generate styles');
  await PostCSS(`${source}/public`, destination);

  logger.info('Copy assets');
  copyFiles(`${source}/public`, destination, { ignore: ['.css'] });

  pages = await generate(`${source}/server/pages`, true);

  for (let i = 0; i < pages.length; i += 1) {
    const page = pages[i];
    logger.debug(`Load static path params for: ${page.urlPath}`);
    tasks.push({ type: 'module', data: { pageIndex: i } });
    defaultLocales.forEach((locale) => {
      tasks.push({ type: 'staticPathParams', data: { pageIndex: i, locale } });
    });
  }

  await startTaskRunner();

  pages.forEach((page, index) => {
    page.attributes.forEach((attributes) => {
      const baseUrl = normalizeUrl(`${getPathPropertyUrl(page.urlPath, attributes.pathParams)}`);
      const localizedUrl = normalizeUrl(`/${attributes.localization.locale}${getPathPropertyUrl(page.urlPath, attributes.pathParams)}`);
      const localizedExportPath = localizedUrl === `/${attributes.localization.locale}`
        ? `/localized-files/${attributes.localization.locale}/index.html`
        : `/localized-files${localizedUrl}.html`;

      if (attributes.localization.locale === defaultLocale) {
        tasks.push({
          type: 'generatePage',
          data: {
            pageIndex: index,
            exportPath: `${baseUrl}.html`,
            localizedExportPath: null,
            attributes: {
              path: baseUrl,
              pathParams: attributes.pathParams,
              localization: prepareLocalizationObject(
                attributes.localization,
                baseUrl,
                localizedUrl,
              ),
            },
          },
        });
      }

      tasks.push({
        type: 'generatePage',
        data: {
          pageIndex: index,
          exportPath: `${localizedUrl}.html`,
          localizedExportPath,
          attributes: {
            path: localizedUrl,
            pathParams: attributes.pathParams,
            localization: prepareLocalizationObject(attributes.localization, baseUrl, localizedUrl),
          },
        },
      });

      sitemap.push(`${config.baseURL}${baseUrl}`);
      sitemap.push(`${config.baseURL}${localizedUrl}`);
    });
  });

  await startTaskRunner();

  logger.info(
    util.inspect(tasks, {
      showHidden: false,
      depth: null,
      colors: true,
    }),
  );

  try {
    fs.writeFileSync(`${destination}/sitemap.txt`, sitemap.join('\n'));
    logger.info(`Rendered: ${destination}/sitemap.txt`);
  } catch (err) {
    logger.err(err);
  }
};

export default build;
