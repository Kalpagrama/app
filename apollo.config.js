require('dotenv').config()

module.exports = {
  client: {
    service: {
      name: 'kalpagramma',
      url: 'https://dev.kalpagramma.com/graphql'
    },
    // Files processed by the extension
    includes: [
      'src/**/*.vue',
      'src/**/*.js'
    ]
  }
}
