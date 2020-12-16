import { ApolloClient, InMemoryCache, ApolloLink, createHttpLink } from '@apollo/client/core'

import { onError } from 'apollo-link-error'
import { WebSocketLink } from 'apollo-link-ws'
import { createUploadLink } from 'apollo-upload-client'

import assert from 'assert'
import isEqual from 'lodash/isEqual'
import { RxCollectionEnum, rxdb } from 'src/system/rxdb'

import {
   getLogFunc,
   LogLevelEnum,
   LogSystemModulesEnum,
   sessionStorage,
   window,
   localStorage,
   isSsr, performance
} from 'src/system/log'
import { AuthApi } from 'src/api/auth'
import axios from 'axios'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.BOOT)
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.BOOT)
const logC = getLogFunc(LogLevelEnum.CRITICAL, LogSystemModulesEnum.BOOT)

let apollo

export default async ({ Vue, store, app }) => {
   try {
      const f = {nameExtra: 'boot::apollo'}
      logD(f, 'start')
      const t1 = performance.now()
      let fetchFunc
      // console.error('apollo::isSsr=', isSsr)
      if (isSsr) {
         fetchFunc = async (uri, options) => {
            options.url = uri
            if (options.body) options.data = options.body
            let result = await axios(options)
            // if (res && res.data) res.body = res.data
            // res.body.text = () => {}

            // Convert the Axios style response into a `fetch` style response
            const responseBody = typeof result.data === 'object' ? JSON.stringify(result.data) : result.data;

            const { Response, Headers } = require('node-fetch')
            const headers = new Headers();
            Object.entries(result.headers).forEach(function ([key, value]) {
               headers.append(key, value);
            })
            let response = new Response(responseBody, {
               status: result.status,
               statusText: result.statusText,
               headers
            });

            return response
         }
      } else {
         fetchFunc = fetch
      }
      if (!sessionStorage.getItem('k_debug')) sessionStorage.setItem('k_debug', '0')
      let kDebug = sessionStorage.getItem('k_debug')// запросы переренаправляются на машину разработчика
      kDebug = kDebug === '1'
      // Vue.use(VueApollo)
      let SERVICES_URL = (process.env.NODE_ENV === 'development' ? process.env.SERVICES_URL_DEBUG : process.env.SERVICES_URL)
      // SERVICES_URL = SERVICES_URL || 'https://dev.kalpa.app/graphql'
      logD('SERVICES_URL=' + SERVICES_URL)
      const errLink = onError(({ operation, response, graphQLErrors, networkError }) => {
         if (graphQLErrors) {
            for (let err of graphQLErrors) {
               logE('gql error', err)
               err.message = err.code + ':' + err.message
               if (err.code === 'USER_NOT_AUTH' || err.code === 'BAD_SESSION' || err.code === 'UNCONFIRMED_LOGIN_DISABLED') {
                  // alert('error on gql request: ' + JSON.stringify(err))
                  AuthApi.logout(null)
                     .then(() => {
                        window.location.reload()
                     })
                     .catch(err => {
                        logE('AuthApi.logout error', err)
                        window.location.reload()
                     })
               } else if (err.code === 'BAD_DATA') {
                  // alert(err.message)
               }
            }
         }
         if (networkError) {
            logE('gql network error', networkError)
            if (networkError.message === 'bad auth token!') {
               // alert('error on gql request2: ' + JSON.stringify(networkError))
               AuthApi.logout(null)
                  .then(() => {
                     window.location.reload()
                  })
                  .catch(err => {
                     logE('AuthApi.logout error', err)
                     window.location.reload()
                  })
            }
         }
      })
      const errLinkWs = onError(({ operation, response, graphQLErrors, networkError }) => {
         // для ошибок ws не делаем логаут/релоад (поскольку оно работает асинхронно)
         if (graphQLErrors) {
            for (let err of graphQLErrors) {
               logE('gql error', err)
            }
         }
         if (networkError) {
            logE('gql network error', networkError)
         }
      })

      const cache = new InMemoryCache()
      const defaultOptions = {
         watchQuery: {
            fetchPolicy: 'no-cache'
         },
         query: {
            fetchPolicy: 'no-cache'
         }
      }
      const servicesApollo = new ApolloClient({
         link: createHttpLink({
            uri: SERVICES_URL,
            fetch (uri, options) {
               if (kDebug) options.headers['X-Kalpagrama-debug'] = 'k_debug'
               return fetchFunc(uri, options)
            }
         }),
         defaultOptions,
         cache
      })
      apollo = {
         cache,
         clients: {
            services: servicesApollo, // нужно для AuthApi.services
            auth: null,
            api: null,
            upload: null,
            ws: null
         }
      }

      const onFetchFunc = async (oldVal, newVal) => {
         logD(' services onFetchFunc...')
         if (oldVal && !isEqual(oldVal, newVal)) {
            logD('new services received! try reload page...')
            window.location.reload() // новые данные будут подхвачены после перезагрузки
         }
      }

      let services = await rxdb.get(RxCollectionEnum.GQL_QUERY, 'services',
         { clientFirst: true, force: true, onFetchFunc })

      logD('services=', services)
      assert(services, '!services!!!')
      let linkAuth = services.authUrl
      let linkApi = services.apiUrl
      let linkWs = services.subscriptionsUrl
      let linkUpload = services.uploadUrl
      const authApollo = new ApolloClient({
         link: ApolloLink.from([
            errLink,
            createHttpLink({
               uri: linkAuth,
               fetch (uri, options) {
                  // logD('authApollo::fetch', localStorage.getItem('k_token'))
                  const token = localStorage.getItem('k_token')
                  if (token) options.headers.Authorization = token
                  if (kDebug) options.headers['X-Kalpagrama-debug'] = 'k_debug'
                  return fetchFunc(uri, options)
               }
               // useGETForQueries: true
            })
         ]),
         defaultOptions,
         cache
      })
      const apiApollo = new ApolloClient({
         link: ApolloLink.from([
            errLink,
            createHttpLink({
               uri: linkApi,
               fetch (uri, options) {
                  const token = localStorage.getItem('k_token')
                  if (token) options.headers.Authorization = token
                  if (kDebug) options.headers['X-Kalpagrama-debug'] = 'k_debug'
                  return fetchFunc(uri, options)
               }
               // useGETForQueries: true
            })
         ]),
         defaultOptions,
         cache,
         connectToDevTools: true
      })
      let wsApollo = null
      if (!isSsr) {
         wsApollo = new ApolloClient({
            link: ApolloLink.from([
               errLinkWs,
               new WebSocketLink({
                  uri: linkWs,
                  options: {
                     minTimeout: 6000,
                     reconnect: true,
                     lazy: true,
                     connectionParams: () => {
                        return {
                           Authorization: localStorage.getItem('k_token'),
                           'X-Kalpagrama-debug': kDebug ? 'k_debug' : ''
                        }
                     }
                  }
               })
            ]),
            defaultOptions,
            cache
         })
      }
      const uploadApollo = new ApolloClient({
         link: ApolloLink.from([
            errLink,
            createUploadLink({
               uri: linkUpload,
               fetch (uri, options) {
                  const token = localStorage.getItem('k_token')
                  if (token) options.headers.Authorization = token
                  if (kDebug) options.headers['X-Kalpagrama-debug'] = 'k_debug'
                  return fetchFunc(uri, options)
               }
            })
         ]),
         defaultOptions,
         cache
      })
      apollo.clients = {
         services: servicesApollo,
         auth: authApollo,
         api: apiApollo,
         upload: uploadApollo,
         ws: wsApollo
      }
      await rxdb.init() // после инициализации apollo (нужно для event.init())
      logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
   } catch (err) {
      logC(err)
      throw err // без apollo работать не можем!
   }
}

export { apollo }
