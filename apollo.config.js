require('dotenv').config()

module.exports = {
  client: {
    service: {
      name: 'kalpagramma',
      url: 'https://test.kalpagramma.com/graphql'
    },
    // Files processed by the extension
    includes: [
      'src/**/*.vue',
      'src/**/*.js'
    ]
  }
}
