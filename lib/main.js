import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { watch } from 'chokidar';
import { renderToString } from 'react-dom/server';
import express, { static as staticFileServe, Router } from 'express';
import { WebSocketServer } from 'ws';
import { I18n } from 'i18n';
import { rmDir, rmFiles } from './modules/common';
import paths from './modules/paths';
import logger from './modules/logger';
import PostCSS from './modules/postcss';
import ESbuild from './modules/esbuild';
import loadMiddleware from './modules/middleware';

import {
  generate,
  requireHot,
  getPathPropertyUrl,
  locales,
  hostname,
} from './modules/pages';

const wss = new WebSocketServer({ port: 3080 });
const source = join(paths.applicationRoot, './src');
const destination = join(paths.applicationRoot, './.cache');

const app = express();
const port = 3000;
const i18n = new I18n();
i18n.configure({
  locales,
  directory: `${paths.applicationRoot}/src/i18n`,
  updateFiles: false,
  autoReload: true,
});

let router;

const populateRouter = async () => {
  router = Router();
  const pages = await generate(`${source}/server/pages`);
  const middlewares = await loadMiddleware();
  pages.forEach((page) => {
    const {
      filePath,
      urlPath,
      urlBasePath,
      localization,
    } = page;

    router.get(urlPath, async (req, res) => {
      try {
        const pathParams = req.params;
        localization.path = getPathPropertyUrl(urlPath, pathParams);
        localization.basePath = getPathPropertyUrl(urlBasePath, pathParams);

        const module = requireHot(filePath);
        if (module.constructor.name === 'Error') throw module;
        if (typeof module.default === 'undefined') throw new Error('No default export defined');

        let properties = {};
        if (typeof module.properties !== 'undefined') properties = await module.properties({ pathParams, localization });

        i18n.setLocale(localization.locale);

        const component = module.default({
          hostname,
          path: urlPath,
          pathParams,
          localization,
          properties,
          i18n,
        });

        let render = renderToString(component);
        render = `<!DOCTYPE html>${render}`;

        res.send(render);
      } catch (err) {
        if (typeof err.stack !== 'undefined') {
          logger.error(err.stack);
          res.set('content-type', 'text/plain');
          res.send(err.stack.replace('/\x1b[[0-9;]*m/g', ''));
        } else {
          logger.error(err);
          res.send(err);
        }
      }
    });

    router.all('/webhook', async (req, res) => {
      if (middlewares.length > 0) {
        logger.info('Webhook middleware execution');
        const promises = [];
        middlewares.filter((middleware) => middleware.type === 'webhook').forEach((middleware) => {
          promises.push(middleware.default());
        });
        await Promise.all(promises);
      }
      // eslint-disable-next-line no-use-before-define
      await build(['client', 'styles', 'assets', 'pages']);
      res.status(201).send('');
    });
  });
};

const build = async (workflows) => {
  try {
    if (!existsSync(destination)) {
      mkdirSync(destination);
    }

    logger.debug('Generate stylesheet');
    rmFiles(destination, { only: 'css' });
    await PostCSS(`${source}/public`, destination);

    logger.debug('Generate client script');
    await rmDir(`${destination}/client`);
    await ESbuild(`${source}/client`, `${destination}/client`);

    if (workflows.includes('pages')) {
      logger.debug('Repopulate pages');
      await populateRouter();
    }
  } catch (err) {
    console.log(err);
  }
};

const init = async (options) => {
  const { hot } = options;

  // Setup Express
  app.use((req, res, next) => router(req, res, next));
  app.use(staticFileServe(destination));
  app.use(staticFileServe(`${source}/public`));
  app.listen(port, () => { });

  if (hot) {
    logger.debug('Livereload is active');
    // Setup Websockets
    let websocket = null;
    wss.on('connection', (ws) => {
      websocket = ws;
    });

    // Watch file changes
    watch(`${paths.applicationRoot}/src`, { ignoreInitial: true }).on('all', async (eventType, filename) => {
      logger.warn('Re-Building application because of change in filesystem');
      const workflows = [];
      if (filename.includes(`${source}/client`)) workflows.push('client');
      if (filename.includes(`${source}/public`) && extname(filename) !== '.css') workflows.push('assets');
      if (extname(filename) === '.jsx' && filename.includes('server') && (eventType === 'add' || eventType === 'unlink')) workflows.push('pages');
      await build(workflows);
      if (websocket) websocket.send('reload');
    });
  }
  // Build website
  await build(['client', 'styles', 'assets', 'pages']);
  logger.debug(`Page available on http://localhost:${port}`);
};

export default init;
