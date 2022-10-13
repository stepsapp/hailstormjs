import fs from 'fs';
import path, { basename, extname } from 'path';
import logger from './logger';

export const getFiles = (directoryPath, previousArrayOfFiles) => {
  const files = fs.readdirSync(directoryPath);
  let arrayOfFiles = previousArrayOfFiles || [];
  files.forEach((file) => {
    if (fs.statSync(`${directoryPath}/${file}`).isDirectory()) {
      arrayOfFiles = getFiles(`${directoryPath}/${file}`, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join('', directoryPath, '/', file));
    }
  });
  return arrayOfFiles;
};

export const copyFile = (srcFilePath, distFilePath) => {
  try {
    const fileName = path.basename(srcFilePath);
    if (fs.existsSync(distFilePath)) {
      logger.debug(`${fileName} already exists`);
      return;
    }
    fs.mkdirSync(path.dirname(distFilePath), { recursive: true });
    fs.copyFileSync(srcFilePath, distFilePath);
    logger.debug(`${fileName} created`);
    return;
  } catch (err) {
    logger.err(err);
  }
};

export const copyFiles = (sourcePath, destinationPath, options) => {
  const { ignore } = options;

  if (sourcePath === destinationPath) return;
  let files = getFiles(sourcePath);
  if (ignore) files = files.filter((file) => !extname(file).includes(ignore));

  files.forEach((srcFilePath) => {
    copyFile(srcFilePath, srcFilePath.replace(sourcePath, destinationPath));
  });
};

export const rmDir = (destinationPath) => {
  try {
    fs.rmSync(destinationPath, { recursive: true, force: true });
  } catch (err) {
    logger.error(err);
  }
};

export const rmFiles = (destinationPath, options) => {
  const { only } = options;

  let files = getFiles(destinationPath);
  if (only) files = files.filter((file) => extname(file).includes(only));

  try {
    files.forEach((srcFilePath) => {
      fs.rmSync(srcFilePath, { force: true });
      logger.debug(`${basename(srcFilePath)} deleted`);
    });
  } catch (err) {
    logger.error(err);
  }
};
