// apollo.config.js
module.exports = {
  client: {
    service: {
      name: 'kalpagramma',
      // URL to the GraphQL API
      url: 'https://api.kalpagramma.com/graphql'
    },
    // Files processed by the extension
    includes: [
      'src/**/*.vue',
      'src/**/*.js'
    ]
  }
}