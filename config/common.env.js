module.exports = {
  APP_CONFIG: {
    name: 'app - common',
    backend: {
      https: true,
      host: 'api.kalpagramma.com',
      port: 443
    },
    frontend: {
      https: true,
      host: 'localhost',
      port: 5000
    },
    api: {
      test: false,
      path: '/api',
      static: '/static'
    },
    graphql: {
      wss: true,
      path: '/graphql',
      socket: '/subscriptions'
    },
    alert: {
      timeout: 5000
    },
    geo: {
      apiKey: '1r69xE72KXnjepruQCEY02KOztLJOaxB'
    }
  }
}
