const path = require('path')
const fs = require('fs')
const webpack = require('webpack')
require('dotenv').config()
// const CopyWebpackPlugin = require('copy-webpack-plugin')
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

module.exports = function (ctx) {
  return {
    preFetch: true,
    boot: [
      'cache',
      'notify',
      'log',
      'i18n',
      'services',
      'apollo',
      'main',
      'filters'
    ],
    css: [
      'fonts.variables.styl',
      'app.styl'
    ],
    extras: [
      'roboto-font',
      'material-icons',
      'fontawesome-v5'
    ],
    framework: {
      all: true,
      animations: 'all',
      components: [
        'QLayout',
        // 'QPullToRefresh',
        'QHeader',
        'QFooter',
        // 'QTabs',
        // 'QTab',
        'QDrawer',
        'QPageContainer',
        // 'QExpansionItem',
        'QPage',
        // 'QToolbar',
        // 'QToolbarTitle',
        'QBtn',
        'QIcon',
        // 'QList',
        // 'QItem',
        // 'QItemSection',
        // 'QItemLabel',
        // 'QCard',
        // 'QItem',
        // 'QAvatar',
        // 'QVideo',
        'QResizeObserver',
        'QInput',
        'QDialog',
        'QScrollArea'
      ],
      directives: [
        'Ripple',
        'TouchPan',
        'TouchSwipe',
        'TouchRepeat'
      ],
      plugins: [
        'Meta',
        'Notify',
        'BottomSheet',
        'AppFullscreen',
        'AddressbarColor'
      ]
    },
    supportIE: false,
    build: {
      env: {
        SERVICES_URL: JSON.stringify(process.env.AUTH_URL) || JSON.stringify(process.env.SERVICES_URL),
        SERVICES_URL_DEBUG: JSON.stringify(process.env.SERVICES_URL_DEBUG)
      },
      scopeHoisting: true,
      vueRouterMode: 'history',
      vueCompiler: true,
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
        if (!ctx.mode.capacitor) { // для PWA и SPA такая зависимость не нужна (см src/system/capacitor)
          cfg.plugins.push(
            new webpack.IgnorePlugin(/@capacitor\/core/)
          )
        }
        // cfg.plugins.push(
        //   new BundleAnalyzerPlugin()
        // )
        // todo отключить source-map когда не потребуется debug(увеличивает размер js в 2 раза)
        // eslint-disable-next-line no-constant-condition
        if (!ctx.mode.capacitor) {
          cfg.devtool = 'source-map'
          cfg.plugins.push(
            new webpack.SourceMapDevToolPlugin({
              filename: '[file].js.map'
            })
          )
          cfg.plugins.push(
            new webpack.EvalSourceMapDevToolPlugin({
              filename: '[file].map'
            })
          )
        }

        cfg.resolve.alias = {
          ...cfg.resolve.alias,
          schema: path.resolve(__dirname, './src/schema')
        }
      }
    },
    devServer: {
      // writeToDisk: true,
      before (app) {
        // const cors = require('cors')
        // app.use(cors())
        // app.use(cors({
        //   origin: 'api.kalpagramma.com',
        //   credentials: true
        // }))
      },
      setup (app) {
        app.post('*', (req, res) => {
          res.redirect(req.originalUrl)
        })
      },
      // headers: {
      //   'Content-Security-Policy': "default-src 'unsafe-eval' 'unsafe-inline' 'self' wss://*:* http://*:* https://*:*",
      // },
      // https: true,
      port: ctx.mode.capacitor ? 8484 : ctx.mode.pwa ? 8383 : 8282,
      host: ctx.mode.capacitor || ctx.mode.spa ? null : 'mac.kalpa.app',
      // https: true,
      https: ctx.mode.capacitor || ctx.mode.spa ? false : {
        key: fs.readFileSync('deploy/dev_server_cert/private.key'),
        cert: fs.readFileSync('deploy/dev_server_cert/certificate.crt')
      },
      open: true // opens browser window automatically
    },
    animations: 'all',
    // animations: [],
    ssr: {
      pwa: false
    },
    pwa: {
      workboxPluginMode: 'InjectManifest',
      workboxOptions: {
        // swDest: 'firebase-messaging-sw.js', // не работает. Приходится делать messaging.useServiceWorker('firebase-messaging-sw.js')
        swSrc: 'src/system/service-worker.js'
        // importWorkboxFrom: 'local'
      },
      manifest: {
        name: 'Kalpagramma',
        short_name: 'Kalpagramma',
        description: 'Up the essence',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#222222',
        theme_color: '#222222',
        icons: [
          {
            src: 'statics/icons/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png'
          },
          {
            src: 'statics/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'statics/icons/icon-256x256.png',
            sizes: '256x256',
            type: 'image/png'
          },
          {
            src: 'statics/icons/icon-384x384.png',
            sizes: '384x384',
            type: 'image/png'
          },
          {
            src: 'statics/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ],
        share_target: {
          // action: '/share-target/',
          // method: 'GET',
          // enctype: 'application/x-www-form-urlencoded',
          // params: {
          //   title: 'title',
          //   text: 'body',
          //   url: 'url'
          // }
          action: '/share_target',
          method: 'POST',
          enctype: 'multipart/form-data',
          params: {
            title: 'title',
            text: 'text',
            url: 'url',
            files: [
              {
                name: 'video',
                accept: ['video/mp4', '.mp4']
              },
              {
                name: 'image',
                accept: 'image/jpeg'
              }
            ]
          }
        }
      }
    },
    capacitor: {
      // iosStatusBarPadding: true, // add the dynamic top padding on iOS mobile devices
      // backButtonExit: false // Quasar handles app exit on mobile phone back button
    }
  }
}
