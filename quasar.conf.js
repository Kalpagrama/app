const path = require('path')
const fs = require('fs')
const webpack = require('webpack')
require('dotenv').config()
// const CopyWebpackPlugin = require('copy-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
// const packageJson = fs.readFileSync('./package.json')
// const version = JSON.parse(packageJson).version || 0

const WorkboxPlugin = require('workbox-webpack-plugin');

module.exports = function (ctx) {
  return {
    preFetch: true,
    boot: [
      'log',
      'rxdb',
      'notify',
      'i18n',
      'apollo',
      'system',
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
      importStrategy: 'auto',
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
        'QCarousel',
        'QCarouselSlide',
        'QResizeObserver',
        'QInput',
        'QDialog',
        'QScrollArea',
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
        'Screen',
        'BottomSheet',
        'AppFullscreen',
        'AddressbarColor',
        'AppVisibility'
      ]
    },
    build: {
      env: {
        SERVICES_URL: process.env.AUTH_URL || process.env.SERVICES_URL,
        SERVICES_URL_DEBUG: process.env.SERVICES_URL_DEBUG,
        BUILD_DATE: (new Date().toISOString()).split('T')[0],
        BUILD_VERSION: require('./package.json').version
      },
      scopeHoisting: true,
      vueRouterMode: ctx.mode.bex ? 'hash' : 'history',
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
        if (ctx.mode.spa) {
          cfg.plugins.push(
            new BundleAnalyzerPlugin()
          )
        }
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
          schema: path.resolve(__dirname, './src/api'),
          public: path.resolve(__dirname, './public')
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
      // https: false,
      https: ctx.mode.capacitor || ctx.mode.spa ? false : {
        key: fs.readFileSync('deploy/dev_server_cert/privkey.pem'),
        cert: fs.readFileSync('deploy/dev_server_cert/cert.pem')
      },
      open: true // opens browser window automatically
    },
    animations: 'all',
    // animations: [],
    ssr: {
      pwa: false
    },
    pwa: {
      workboxPluginMode: 'InjectManifest', // 'GenerateSW', //
      workboxOptions: {
        // swDest: 'firebase-messaging-sw.js', // не работает. Приходится делать messaging.useServiceWorker('firebase-messaging-sw.js')
        // importWorkboxFrom: 'local'
        swSrc: 'src/system/service-worker.js',
        swDest: 'service-worker.js',
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
            src: 'icons/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png'
          },
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/icon-256x256.png',
            sizes: '256x256',
            type: 'image/png'
          },
          {
            src: 'icons/icon-384x384.png',
            sizes: '384x384',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512x512.png',
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
      },

      metaVariables: {
        appleMobileWebAppCapable: 'yes',
        appleMobileWebAppStatusBarStyle: 'default',
        appleTouchIcon120: 'icons/apple-icon-120x120.png',
        appleTouchIcon180: 'icons/apple-icon-180x180.png',
        appleTouchIcon152: 'icons/apple-icon-152x152.png',
        appleTouchIcon167: 'icons/apple-icon-167x167.png',
        appleSafariPinnedTab: 'icons/safari-pinned-tab.svg',
        msapplicationTileImage: 'icons/ms-icon-144x144.png',
        msapplicationTileColor: '#222222'
      },

    },
    capacitor: {
      // iosStatusBarPadding: true, // add the dynamic top padding on iOS mobile devices
      // backButtonExit: false // Quasar handles app exit on mobile phone back button
    },
    // vendor: {
    //   remove: ['vue', 'rxdb', 'rxjs', 'quasar', 'axios', 'mediaelement', 'lodash']
    // }
    // chainWebpack (chain) {
    //   chain.optimization.get('splitChunks').cacheGroups.vendors.name = (_module, chunks) => {
    //     const allChunksNames = chunks.map((item) => item.name).join('~')
    //     if (allChunksNames) return 'vendor'
    //     else return !ctx.prod
    //   }
    // }
  }
}
