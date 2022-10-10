require('@babel/preset-env')
require('@babel/preset-react')
require('@babel/register')({
    ignore: [],
    configFile: `${require('./paths').moduleRoot}/lib/config/babel.config.json`,
})
