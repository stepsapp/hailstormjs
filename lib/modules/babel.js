const helpers = require('./helpers')

require('@babel/preset-env')
require('@babel/preset-react')
require('@babel/register')({
    ignore: [],
    configFile: `${helpers.paths.moduleRoot}/lib/config/babel.config.json`,
})
