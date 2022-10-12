require('@babel/preset-env');
require('@babel/preset-react');
require('@babel/register')({
  ignore: [],
  // eslint-disable-next-line global-require
  configFile: `${require('./paths').moduleRoot}/lib/config/babel.config.json`,
});
