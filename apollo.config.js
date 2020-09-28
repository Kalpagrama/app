require('dotenv').config()

console.log('SERVICES_URL=', process.env.SERVICES_URL_DEBUG)
module.exports = {
  client: {
    service: {
      name: 'kalpagrama',
      url: process.env.SERVICES_URL_DEBUG
    },
    // Files processed by the extension
    includes: [
      'src/**/*.vue',
      'src/**/*.js'
    ]
  }
}
