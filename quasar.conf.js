const path = require('path')
const webpack = require('webpack')
require('dotenv').config()

module.exports = function (ctx) {
  return {
    preFetch: true,
    boot: [
      'i18n',
      'main',
      'apollo',
      'filters'
    ],
    css: [
      'fonts.variables.styl',
      'app.styl'
    ],
    extras: [
      'roboto-font',
      'material-icons',
      // 'ionicons-v4',
      // 'mdi-v3',
      'fontawesome-v5'
      // 'eva-icons'
    ],
    framework: {
      all: true,
      components: [
        'QLayout',
        'QPullToRefresh',
        'QHeader',
        'QFooter',
        'QTabs',
        'QTab',
        'QDrawer',
        'QPageContainer',
        'QExpansionItem',
        'QPage',
        'QToolbar',
        'QToolbarTitle',
        'QBtn',
        'QIcon',
        'QList',
        'QItem',
        'QItemSection',
        'QItemLabel',
        'QCard',
        'QItem',
        'QAvatar',
        'QVideo'
      ],
      directives: [
        'Ripple',
        'TouchPan',
        'TouchSwipe'
      ],
      plugins: [
        'Notify',
        'BottomSheet'
      ]
      // iconSet: 'ionicons-v4'
      // lang: 'de' // Quasar language
    },
    supportIE: false,
    build: {
      env: {
        AUTH_URL: JSON.stringify(process.env.AUTH_URL)
      },
      scopeHoisting: true,
      vueRouterMode: 'history',
      vueCompiler: true,
      // distDir: path.resolve(__dirname, 'public'),
      distDir: 'dist',
      // gzip: true,
      // analyze: true,
      // extractCSS: false,
      extendWebpack (cfg) {
        cfg.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /node_modules/
        })
        cfg.module.rules.push({
          test: /\.(pug)$/,
          loader: 'pug-plain-loader',
          exclude: /node_modules/
        })
        cfg.plugins.push(
          new webpack.ProvidePlugin({
            Vue: 'vue',
            Quasar: 'quasar',
            _: 'lodash',
            lodash: 'lodash',
            gql: 'graphql-tag'
          })
        )
      }
    },
    devServer: {
      before (app) {
        // const cors = require('cors')
        // app.use(cors())
        // app.use(cors({
        //   origin: 'api.kalpagramma.com',
        //   credentials: true
        // }))
      },
      // https: true,
      port: 8282,
      open: true // opens browser window automatically
    },
    animations: 'all',
    // animations: [],
    ssr: {
      pwa: false
    },
    pwa: {
      // workboxPluginMode: 'InjectManifest',
      // workboxOptions: {},
      manifest: {
        name: 'Kalpagramma',
        short_name: 'Kalpagramma',
        description: 'Find your gala-effect',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#000',
        theme_color: '#000',
        icons: [
          {
            'src': 'statics/icons/icon-256x256.png',
            'sizes': '256x256',
            'type': 'image/png'
          }
        ],
        share_target: {
          action: '/share-target/',
          method: 'GET',
          enctype: 'application/x-www-form-urlencoded',
          params: {
            title: 'SHaRe kalpagramma',
            text: 'what u want to sshrare JSON.stringify',
            url: '/share'
          }
        }
      }
    },
    cordova: {
      // id: 'org.cordova.quasar.app'
    },
    electron: {
      // bundler: 'builder', // or 'packager'
      extendWebpack (cfg) {
        // do something with Electron main process Webpack cfg
        // chainWebpack also available besides this extendWebpack
      },
      packager: {
        // https://github.com/electron-userland/electron-packager/blob/master/docs/api.md#options
        // OS X / Mac App Store
        // appBundleId: '',
        // appCategoryType: '',
        // osxSign: '',
        // protocol: 'myapp://path',
        // Window only
        // win32metadata: { ... }
      },
      builder: {
        // https://www.electron.build/configuration/configuration
        // appId: 'quasar-app'
      }
    }
  }
}
