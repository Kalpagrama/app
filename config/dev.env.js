let fs = require('fs')
let _ = require('lodash')
let commonEnv = require('./common.env')

// local
let localEnv
if (fs.existsSync(`${__dirname}/local.env.js`)) {
  localEnv = require('./local.env')
}

module.exports = _.merge({}, commonEnv, {
  APP_CONFIG: JSON.stringify(_.merge({}, commonEnv.APP_CONFIG, {
    name: 'app - dev',
    logger: {
      logLevel: 'debug',
      showLogLevel: true
    }
  }, localEnv ? localEnv.APP_CONFIG : {}))
})
