const path = require('path')
const fs = require('fs')
const webpack = require('webpack')
require('dotenv').config()
// const CopyWebpackPlugin = require('copy-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

const WorkboxPlugin = require('workbox-webpack-plugin');

module.exports = function (ctx) {
   return {
      // https://quasar.dev/quasar-cli/supporting-ts
      supportTS: false,
      preFetch: true,

      // app boot file (/src/boot)
      // --> boot files are part of "main.js"
      // https://quasar.dev/quasar-cli/boot-files
      boot: [
         // { path: 'log_ssr', client: false },
         // { path: 'log', server: false },
         'log',
         'rxdb',
         'notify',
         'i18n',
         'apollo',
         'system',
         'main',
         'components',
         'helpers',
         'filters'
      ],

      // https://quasar.dev/quasar-cli/quasar-conf-js#Property%3A-css
      css: [
         // 'quasar.variables.sass',
         'fonts.variables.sass',
         'app.sass',
      ],

      animations: 'all',

      // https://github.com/quasarframework/quasar/tree/dev/extras
      extras: [
         'roboto-font',
         'material-icons',
         'fontawesome-v5'
      ],

      // https://quasar.dev/quasar-cli/quasar-conf-js#Property%3A-framework
      framework: {
         // lang: 'ru',
         importStrategy: 'auto',
         // components: [
         //    'QLayout',
         //    // 'QPullToRefresh',
         //    'QHeader',
         //    'QFooter',
         //    // 'QTabs',
         //    // 'QTab',
         //    'QDrawer',
         //    'QPageContainer',
         //    // 'QExpansionItem',
         //    'QPage',
         //    // 'QToolbar',
         //    // 'QToolbarTitle',
         //    'QBtn',
         //    'QIcon',
         //    // 'QList',
         //    // 'QItem',
         //    // 'QItemSection',
         //    // 'QItemLabel',
         //    // 'QCard',
         //    // 'QItem',
         //    // 'QAvatar',
         //    // 'QVideo',
         //    'QCarousel',
         //    'QCarouselSlide',
         //    'QResizeObserver',
         //    'QInput',
         //    'QDialog',
         //    'QScrollArea'
         // ],
         // directives: [
         //    'Ripple',
         //    'TouchPan',
         //    'TouchSwipe',
         //    'TouchRepeat'
         // ],
         plugins: [
            'Meta',
            'Notify',
            'Screen',
            'BottomSheet',
            'AppFullscreen',
            'AddressbarColor',
            'AppVisibility',
            'Dialog',
            // 'LoadingBar',
            'Loading'
         ]
      },

      // Full list of options: https://quasar.dev/quasar-cli/quasar-conf-js#Property%3A-build
      build: {
         env: {
            DOCKER_MACHINE_NAME: process.env.DOCKER_MACHINE_NAME || 'local', // имя контенйнера, в котором собран фронт (для того чтобы различать production от dev) (api-dev,api-main,vercel,local)
            ORIGIN_URL: process.env.ORIGIN_URL,
            ORIGIN_URL_DEBUG: ctx.mode.pwa && ctx.dev ? process.env.ORIGIN_URL_DEBUG_MAC : process.env.ORIGIN_URL_DEBUG,
            SERVICES_URL: process.env.SERVICES_URL,
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
            // cfg.performance = {
            //    hints: false,
            //    maxEntrypointSize: 512000000,
            //    maxAssetSize: 512000000
            // }
            cfg.module.rules.push({
               test: /\.md$/i,
               use: 'raw-loader'
            })
            // cfg.module.rules.push({
            //    test: /\.dmg$/i,
            //    use: 'file-loader'
            // })
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
            if (ctx.dev && !ctx.mode.ssr) {
               cfg.plugins.push(
                  new BundleAnalyzerPlugin({ analyzerPort: ctx.mode.capacitor ? 7777 : ctx.mode.pwa ? 8888 : 9999 })
               )
            }
            // todo отключить source-map когда не потребуется debug(увеличивает размер js в 2 раза)
            // eslint-disable-next-line no-constant-condition
            if (ctx.dev) {
               if (!ctx.mode.capacitor) {
                  cfg.devtool = 'inline-source-map' // 'source-map'
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
            }

            // cfg.plugins.push(
            //    new TerserPlugin(),
            // );

            cfg.resolve.alias = {
               ...cfg.resolve.alias,
               schema: path.resolve(__dirname, './src/api'),
               public: path.resolve(__dirname, './public')
            }
            if (!ctx.mode.ssr) {
               cfg.optimization = {
                  runtimeChunk: 'single',
                  splitChunks: {
                     chunks: 'all',
                     maxInitialRequests: Infinity,
                     // minSize: 0,
                     cacheGroups: {
                        vendor: {
                           test: /[\\/]node_modules[\\/]/,
                           name (module) {
                              // получает имя, то есть node_modules/packageName/not/this/part.js
                              // или node_modules/packageName
                              const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];

                              // имена npm-пакетов можно, не опасаясь проблем, использовать
                              // в URL, но некоторые серверы не любят символы наподобие @
                              return 'npm.' + packageName.replace('@', '_sobaka_').replace(':', '_colon_');
                           }
                        }
                     }
                  }
               }
            }
         }
      },

      // Full list of options: https://quasar.dev/quasar-cli/quasar-conf-js#Property%3A-devServer
      devServer: {
         // writeToDisk: true,
         before (app) {
            // const cors = require('cors')
            // app.use(cors())
            // app.use(cors({
            //   origin: 'api.kalpagrama.com',
            //   credentials: true
            // }))
         },
         setup (app) {
            app.post('*', (req, res) => {
               res.redirect(req.originalUrl)
            })
         },
         // headers: {
         // //   'Content-Security-Policy': "default-src 'unsafe-eval' 'unsafe-inline' 'self' wss://*:* http://*:* https://*:*",
         // },
         port: ctx.mode.ssr ? 8585 : ctx.mode.capacitor ? 8484 : ctx.mode.pwa ? 8383 : 8282,
         host: ctx.mode.capacitor || ctx.mode.spa ? null : 'mac.kalpa.app',
         https: ctx.mode.capacitor || ctx.mode.spa ? false : {
            key: fs.readFileSync('deploy/dev_server_cert/privkey.pem'),
            cert: fs.readFileSync('deploy/dev_server_cert/cert.pem')
         },
         open: false // opens browser window automatically
      },

      // animations: 'all', // --- includes all animations
      // https://quasar.dev/options/animations
      //  animations: 'all', // animations: [],

      ssr: {
         pwa: false, // should a PWA take over (default: false), or just a SPA?
         // manualHydration: true
         // manualHydration: true/false, // (@quasar/app v1.4.2+) Manually hydrate the store
         // componentCache: {...} // lru-cache package options,

         // -- @quasar/app v1.9.5+ --
         // optional; add/remove/change properties
         // of production generated package.json
         // extendPackageJson (pkg) {
         //    // directly change props of pkg;
         //    // no need to return anything
         // },

         // -- @quasar/app v1.5+ --
         // optional; webpack config Object for
         // the Webserver part ONLY (/src-ssr/)
         // which is invoked for production (NOT for dev)
         // extendWebpack (cfg) {
         //    // directly change props of cfg;
         //    // no need to return anything
         // },

         // -- @quasar/app v1.5+ --
         // optional; EQUIVALENT to extendWebpack() but uses webpack-chain;
         // the Webserver part ONLY (/src-ssr/)
         // which is invoked for production (NOT for dev)
         // chainWebpack (chain) {
         //    // chain is a webpack-chain instance
         //    // of the Webpack configuration
         // }
      },

      pwa: {
         workboxPluginMode: 'InjectManifest', // 'GenerateSW', //
         workboxOptions: {
            // swDest: 'firebase-messaging-sw.js', // не работает. Приходится делать messaging.useServiceWorker('firebase-messaging-sw.js')
            // importWorkboxFrom: 'local'
            swSrc: 'src/system/service-worker.js',
            swDest: 'service-worker.js',
            maximumFileSizeToCacheInBytes: 1024 * 1024 * 20
         },
         manifest: {
            name: 'Kalpagrama',
            short_name: 'Kalpagrama',
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
               // action: '/share/',
               // method: 'GET',
               // enctype: 'application/x-www-form-urlencoded',
               // params: {
               //   title: 'title',
               //   text: 'body',
               //   url: 'url'
               // }
               action: '/share',
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
         }
      },

      // Full list of options: https://quasar.dev/quasar-cli/developing-capacitor-apps/configuring-capacitor
      capacitor: {
         hideSplashscreen: false, // disables auto-hiding the Splashscreen by Quasar CLI
         iosStatusBarPadding: true, // add the dynamic top padding on iOS mobile devices
         backButtonExit: false // Quasar handles app exit on mobile phone back button
      }
   }
}
