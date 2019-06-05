require('dotenv').config()

module.exports = {
  client: {
    service: {
      name: 'kalpagramma',
      url: JSON.stringify(process.env.SERVICES_URL)
    },
    // Files processed by the extension
    includes: [
      'src/**/*.vue',
      'src/**/*.js'
    ]
  }
}
