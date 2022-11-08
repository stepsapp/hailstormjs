import { join } from 'path';
import { existsSync } from 'fs';
import { getFiles } from './common';
import paths from './paths';

const middlewarePath = join(paths.applicationRoot, './src/server/middleware');

const loadMiddleware = async () => {
  if (existsSync(middlewarePath)) {
    const middleWarePromises = [];
    getFiles(middlewarePath).forEach((middlewareFilePath) => {
      middleWarePromises.push(import(middlewareFilePath));
    });
    const middlewares = await Promise.all(middleWarePromises);
    return middlewares;
  }
  return [];
};

export default loadMiddleware;
