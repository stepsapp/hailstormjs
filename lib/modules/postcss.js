import fs from 'fs';
import { basename, dirname, extname } from 'path';
import autoprefixer from 'autoprefixer';
import tailwind from 'tailwindcss';
import postcss from 'postcss';
import { getFiles } from './common';
import logger from './logger';

export default (sourcePath, destinationPath) =>
  new Promise((resolve, reject) => {
    const cssFiles = getFiles(sourcePath).filter((file) => extname(file) === '.css');
    for (let index = 0; index < cssFiles.length; index += 1) {
      const srcFilePath = cssFiles[index];
      const distFilePath = srcFilePath.replace(sourcePath, destinationPath);

      fs.mkdir(dirname(distFilePath), { recursive: true }, (err) => {
        if (err) throw err;
        fs.readFile(srcFilePath, (errorRead, css) => {
          if (errorRead) reject();
          postcss([autoprefixer, tailwind])
            .process(css, { from: srcFilePath, to: distFilePath })
            .then((result) => {
              fs.writeFile(distFilePath, result.css, () => true);
              logger.debug(`${basename(distFilePath)} created`);
              resolve();
            })
            .catch((error) => {
              logger.error(error);
              reject();
            });
        });
      });
    }
  });
