/*
 * This file runs in a Node context (it's NOT transpiled by Babel), so use only
 * the ES6 features that are supported by your Node version. https://node.green/
 */

// Configuration for your app
// https://quasar.dev/quasar-cli/quasar-conf-js

const path = require('path')
const fs = require('fs')
const webpack = require('webpack')
require('dotenv').config()
const WorkboxPlugin = require('workbox-webpack-plugin');
const useCustomSW = process.env.USE_CUSTOM_SW === 'true'

/* eslint-env node */
const ESLintPlugin = require('eslint-webpack-plugin')
const { configure } = require('quasar/wrappers')

module.exports = configure(function (ctx) {
   // console.log('ctx = ', ctx)
   // console.log('process.env = ', process.env)
   return {
      // https://quasar.dev/quasar-cli/supporting-ts
      supportTS: false,
      // https://quasar.dev/quasar-cli/prefetch-feature
      preFetch: true,
      // https://quasar.dev/quasar-cli/boot-files
      boot: [
         'start',
         'log',
         'notify',
         'rxdb',
         'i18n',
         'apollo',
         'helpers',
         ...(process.env.RUN_TESTS ? ['tests'] : ['libs', 'components', 'system']), // запустить рантайм-тесты после инициализации приложения
         'end'
      ].filter(b => !!b),

      // https://quasar.dev/quasar-cli/quasar-conf-js#Property%3A-css
      css: [
         'app.sass'
      ],

      animations: 'all', // --- includes all animations
      // https://quasar.dev/options/animations
      // animations: [],

      // https://github.com/quasarframework/quasar/tree/dev/extras
      extras: [
         // 'ionicons-v4',
         // 'mdi-v5',
         // 'fontawesome-v5',
         // 'eva-icons',
         // 'themify',
         // 'line-awesome',
         // 'roboto-font-latin-ext', // this or either 'roboto-font', NEVER both!
         'roboto-font',
         'material-icons',
         'material-icons-outlined',
         'fontawesome-v5'
      ],

      // https://quasar.dev/quasar-cli/quasar-conf-js#Property%3A-framework
      framework: {
         config: {},
         lang: 'ru', // Quasar language pack

         // For special cases outside of where the auto-import strategy can have an impact
         // (like functional components as one of the examples),
         // you can manually specify Quasar components/directives to be available everywhere:
         //
         // components: [],
         // directives: [],

         // Quasar plugins
         plugins: [
            'Meta',
            'Notify',
            'Screen',
            'AppVisibility',
            'AppFullscreen',
            'Dialog',
            'Loading'
         ]
      },

      // Full list of options: https://quasar.dev/quasar-cli/quasar-conf-js#Property%3A-build
      build: {
         env: {
            USE_CUSTOM_SW: useCustomSW, // использовать кастомный сервисворкер(push, etc)
            DOCKER_MACHINE_NAME: process.env.DOCKER_MACHINE_NAME || 'local', // имя контенйнера, в котором собран фронт (для того чтобы различать production от dev) (api-dev,api-yc,vercel,local)
            ORIGIN_URL: (() => {
               switch (process.env.DOCKER_MACHINE_NAME || '') {
                  case 'vercel': return process.env.ORIGIN_URL_VERCEL
                  case 'api-dev': return process.env.ORIGIN_URL_DEBUG
                  case '': return ctx.mode.pwa && ctx.dev ? process.env.ORIGIN_URL_DEBUG_MAC : process.env.ORIGIN_URL_DEBUG // localhost
                  default: return process.env.ORIGIN_URL
               }
            })(),
            SERVICES_URL: (() => {
               if (sessionStorage.getItem('k_debug') === '2') return process.env.SERVICES_URL_LOCAL
               if (ctx.mode.capacitor && ctx.prod) return process.env.SERVICES_URL
               switch (process.env.DOCKER_MACHINE_NAME || '') {
                  case 'vercel': return process.env.SERVICES_URL_VERCEL
                  case 'api-dev': return process.env.SERVICES_URL_DEBUG
                  case '': return process.env.SERVICES_URL_DEBUG // localhost
                  default: return process.env.SERVICES_URL
               }
            })(),
            BUILD_DATE: (new Date().toISOString()).split('T')[0],
            BUILD_VERSION: require('./package.json').version
         },
         vueRouterMode: 'history', // available values: 'hash', 'history'
         publicPath: '/',
         // vueCompiler: true, // -- Если нужно компилировать шаблоны на клиенте (например, передаёте строку в опцию template...
         // transpile: false,
         // Add dependencies for transpiling with Babel (Array of string/regex)
         // (from node_modules, which are by default not transpiled).
         // Applies only if "transpile" is set to true.
         // transpileDependencies: [],

         // source-map нужен для debug (увеличивает размер js в 2 раза)
         // sourceMap: true,
         devtool: 'eval-source-map',
         preloadChunks: true,
         // gzip: true,
         distDir: 'dist',
         // отключено для deploy (иначе проблемы при деплое   (не отдается управление в консоль))
         analyze: process.env.DOCKER_MACHINE_NAME || ctx.mode.capacitor ? false : { analyzerPort: ctx.mode.pwa ? 8888 : 9999 },

         // Options below are automatically set depending on the env, set them if you want to override
         // extractCSS: false,

         // https://quasar.dev/quasar-cli/handling-webpack
         extendWebpack (cfg) {
            cfg.module.rules.push({
               test: /\.md$/i,
               use: 'raw-loader'
            })
            cfg.module.rules.push({
               test: /\.(pug)$/,
               loader: 'pug-plain-loader',
               exclude: /node_modules/
            })

            cfg.plugins.push(
               new ESLintPlugin({
                  extensions: ['js', 'vue'],
                  exclude: ['node_modules']
               })
            )

            cfg.plugins.push(
               new webpack.ProvidePlugin({
                  Quasar: 'quasar',
                  // _: 'lodash',
                  gql: 'graphql-tag'
               })
            )
            if (!ctx.mode.capacitor) { // для PWA и SPA такая зависимость не нужна (см src/system/capacitor)
               cfg.plugins.push(
                  new webpack.IgnorePlugin({ resourceRegExp: /@capacitor\/core/ })
               )
            }
            cfg.resolve.fallback = {
               ...cfg.resolve.fallback,
               fs: false
            }
            cfg.resolve.alias = {
               ...cfg.resolve.alias,
               schema: path.resolve(__dirname, './src/api'),
               public: path.resolve(__dirname, './public'),
               tests: path.resolve(__dirname, './tests')
               // vue: '@vue/compat'
            }
            if (!ctx.mode.bex && !ctx.mode.ssr) {
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
                              let packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
                              if (!packageName) throw new Error('bad package name !!!' + module.context.toString())
                              // имена npm-пакетов можно, не опасаясь проблем, использовать
                              // в URL, но некоторые серверы не любят символы наподобие @
                              if (packageName.startsWith('pouchdb-')) packageName = 'npm.pouchdb'
                              else if (packageName.startsWith('d3-')) packageName = 'npm.d3js'
                              else if (packageName.includes('apollo')) packageName = 'npm.apollo'
                              else if (packageName.includes('lodash')) packageName = 'npm.lodash'
                              else if (packageName.includes('quasar')) packageName = 'npm.quasar'
                              else if (packageName.includes('contentful')) packageName = 'npm.contentful'
                              else packageName = 'npm.' + packageName.replace('@', '_sobaka_').replace(':', '_colon_');
                              return packageName
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
         // devMiddleware: {
         //   index: true,
         //   writeToDisk: true,
         // },
         // vueDevtools: true,
         onBeforeSetupMiddleware (devServer) {
            // const cors = require('cors')
            // devServer.app.use(cors())
            // devServer.app.use(cors({
            //   origin: 'api.kalpagrama.com',
            //   credentials: true
            // }))
         },
         onAfterSetupMiddleware (devServer) {
            devServer.app.post('*', (req, res) => {
               res.redirect(req.originalUrl)
            })
         },
         // headers: {
         // //   'Content-Security-Policy': "default-src 'unsafe-eval' 'unsafe-inline' 'self' wss://*:* http://*:* https://*:*",
         // },
         port: ctx.mode.ssr ? 8585 : ctx.mode.capacitor ? 8484 : ctx.mode.pwa ? 8383 : 8282,
         host: ctx.mode.capacitor || ctx.mode.spa || ctx.mode.bex ? null : 'mac.kalpa.app',
         https: ctx.mode.capacitor || ctx.mode.spa
            ? false
            : {
               key: fs.readFileSync('deploy/dev_server_cert/privkey.pem'),
               cert: fs.readFileSync('deploy/dev_server_cert/cert.pem')
            },
         open: false // opens browser window automatically

      },

      // https://quasar.dev/quasar-cli/developing-pwa/configuring-pwa
      pwa: {
         workboxPluginMode: useCustomSW ? 'InjectManifest' : 'GenerateSW',
         workboxOptions: useCustomSW
            ? {
               // swDest: 'firebase-messaging-sw.js', // не работает. Приходится делать messaging.useServiceWorker('firebase-messaging-sw.js')
               // importWorkboxFrom: 'local'
               // swSrc: 'src/system/service-worker.js',
               // swDest: 'service-worker.js',
               maximumFileSizeToCacheInBytes: 1024 * 1024 * 20
            }
            : {
               skipWaiting: true,
               clientsClaim: true,
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
         },
         // for the custom service worker ONLY (/src-pwa/custom-service-worker.[js|ts])
         // if using workbox in InjectManifest mode
         chainWebpackCustomSW (chain) {
            chain.plugin('eslint-webpack-plugin')
               .use(ESLintPlugin, [{ extensions: ['js'] }])
         }
      },

      // Full list of options: https://quasar.dev/quasar-cli/developing-capacitor-apps/configuring-capacitor
      capacitor: {
         hideSplashscreen: false, // disables auto-hiding the Splashscreen by Quasar CLI
         iosStatusBarPadding: true, // add the dynamic top padding on iOS mobile devices
         backButtonExit: false // Quasar handles app exit on mobile phone back button
      },

      // https://quasar.dev/quasar-cli/developing-ssr/configuring-ssr
      ssr: {
         pwa: false,

         // manualStoreHydration: true,
         // manualPostHydrationTrigger: true,

         prodPort: 3000, // The default port that the production server should use
         // (gets superseded if process.env.PORT is specified at runtime)

         maxAge: 1000 * 60 * 60 * 24 * 30,
         // Tell browser when a file from the server should expire from cache (in ms)

         chainWebpackWebserver (chain) {
            chain.plugin('eslint-webpack-plugin')
               .use(ESLintPlugin, [{ extensions: ['js'] }])
         },

         middlewares: [
            ctx.prod ? 'compression' : '',
            'render' // keep this as last one
         ]
      },

      // Full list of options: https://quasar.dev/quasar-cli/developing-cordova-apps/configuring-cordova
      cordova: {
         // noIosLegacyBuildFlag: true, // uncomment only if you know what you are doing
      },

      // Full list of options: https://quasar.dev/quasar-cli/developing-electron-apps/configuring-electron
      electron: {
         bundler: 'packager', // 'packager' or 'builder'

         packager: {
            // https://github.com/electron-userland/electron-packager/blob/master/docs/api.md#options

            // OS X / Mac App Store
            // appBundleId: '',
            // appCategoryType: '',
            // osxSign: '',
            // protocol: 'myapp://path',

            // Windows only
            // win32metadata: { ... }
         },

         builder: {
            // https://www.electron.build/configuration/configuration

            appId: 'app_vue3'
         },

         // "chain" is a webpack-chain object https://github.com/neutrinojs/webpack-chain
         chainWebpackMain (chain) {
            chain.plugin('eslint-webpack-plugin')
               .use(ESLintPlugin, [{ extensions: ['js'] }])
         },

         // "chain" is a webpack-chain object https://github.com/neutrinojs/webpack-chain
         chainWebpackPreload (chain) {
            chain.plugin('eslint-webpack-plugin')
               .use(ESLintPlugin, [{ extensions: ['js'] }])
         }
      }
   }
})
