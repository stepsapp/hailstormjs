import { extname, join } from 'path';
import { watch } from 'chokidar';
import { renderToString } from 'react-dom/server';
import express, { static as staticFileServe, Router } from 'express';
import { WebSocketServer } from 'ws';
import config from './config';
import { copyFiles, rmDir, rmFiles } from './modules/common';
import paths from './modules/paths';
import logger from './modules/logger';
import PostCSS from './modules/postcss';
import ESbuild from './modules/esbuild';
import { generate, requireHot } from './modules/pages';

const wss = new WebSocketServer({ port: 3080 });
const source = join(paths.applicationRoot, './src');
const destination = join(paths.applicationRoot, './.cache');
const app = express();
const port = 3000;

let router;

const populateRouter = async () => {
  router = Router();
  const pages = await generate(`${source}/server/pages`);
  pages.forEach((page) => {
    // eslint-disable-next-line object-curly-newline
    const { filePath, urlPath, localization, pathParams } = page;
    router.get(urlPath, async (req, res) => {
      try {
        const module = requireHot(filePath);
        if (module.constructor.name === 'Error') throw module;
        if (typeof module.default === 'undefined') throw new Error('No default export defined');

        let properties = {};
        const pathParamsMerged = { ...pathParams, ...req.params };
        if (typeof module.properties !== 'undefined') properties = await module.properties({ pathParams: pathParamsMerged, localization });

        const component = module.default({
          path: urlPath,
          pathParams: pathParamsMerged,
          localization,
          properties,
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
  });

  router.get('/sitemap.txt', async (req, res) => {
    res.set('content-type', 'text/plain');
    res.send(pages.map((page) => `${config.baseURL}${page.urlPath}`).join('\n'));
  });

  router.get('/webhook', async (req, res) => {
    // eslint-disable-next-line no-use-before-define
    await build(['client', 'styles', 'assets', 'pages']);
    res.status(201).send('');
  });
};

const build = async (workflows) => {
  try {
    logger.debug('Generate stylesheet');
    rmFiles(destination, { only: 'css' });
    await PostCSS(`${source}/public`, destination);

    if (workflows.includes('client')) {
      logger.debug('Generate client script');
      rmDir(`${destination}/client`);
      await ESbuild(`${source}/client`, `${destination}/client`);
    }

    if (workflows.includes('assets')) {
      logger.debug('Copy assets');
      copyFiles(`${source}/public`, destination, { ignore: ['.css'] });
    }

    if (workflows.includes('pages')) {
      logger.debug('Repopulate pages');
      await populateRouter();
    }
  } catch (err) {
    logger.warn(err);
  }
};

const init = async (options) => {
  const { hot } = options;

  // Setup Express
  app.use((req, res, next) => router(req, res, next));
  app.use(staticFileServe(destination));
  app.listen(port, () => {});

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
      if (extname(filename) === '.jsx' && filename.includes('server')) workflows.push('pages');
      await build(workflows);
      if (websocket) websocket.send('reload');
    });
  }
  // Build website
  await build(['client', 'styles', 'assets', 'pages']);
  logger.debug(`Page available on http://localhost:${port}`);
};

export default init;
