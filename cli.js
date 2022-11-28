#!/usr/bin/env node
/* eslint-disable global-require */
require('./lib/modules/babel');
const paths = require('./lib/modules/paths');

const exec = async (cmd) => {
  const pjson = require('./package.json');
  const { copyFiles, copyFile } = require('./lib/modules/common');
  const logger = require('./lib/modules/logger').default;
  logger.debug(`Hailstorm - ${pjson.version}`);

  switch (cmd) {
    case 'start':
      require('./lib/main').default({ hot: false });
      break;
    case 'watch':
      require('./lib/main').default({ hot: true });
      break;
    case 'build':
      require('./lib/build').default();
      break;
    case 'init':
      logger.debug('Copying .firebaserc');
      copyFile(`${paths.moduleRoot}/.firebaserc`, `${paths.applicationRoot}/.firebaserc`);
      logger.debug('Copying hailstorm config.');
      copyFile(`${paths.moduleRoot}/hailstorm.config.js`, `${paths.applicationRoot}/hailstorm.config.js`);
      logger.debug('Copying tailwind config.');
      copyFile(`${paths.moduleRoot}/tailwind.config.js`, `${paths.applicationRoot}/tailwind.config.js`);
      logger.debug('Copying requirements');
      copyFiles(`${paths.moduleRoot}/src`, `${paths.applicationRoot}/src`, {});
      break;
    default:
      logger.info('options: start | watch | build | init');
      break;
  }
};

if (typeof process.env.NODE_ENV === 'undefined') {
  const environment = process.argv.slice(2)[1];
  if (environment) {
    process.env.NODE_ENV = environment;
  }
}

const cmd = process.argv.slice(2)[0];
exec(cmd);
