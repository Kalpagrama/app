import { ApolloClient } from 'apollo-client'
import { ApolloLink } from 'apollo-link'
import { onError } from 'apollo-link-error'
import { InMemoryCache, IntrospectionFragmentMatcher } from 'apollo-cache-inmemory'
import introspectionQueryResultData from '../api/graphql.schema.json'
import { createHttpLink } from 'apollo-link-http'
import { WebSocketLink } from 'apollo-link-ws'
import { createUploadLink } from 'apollo-upload-client'
import possibleTypes from 'public/scripts/possibleTypes.json'
import assert from 'assert'
import isEqual from 'lodash/isEqual'
import { RxCollectionEnum, rxdb } from 'src/system/rxdb'
import { getLogFunc, LogLevelEnum, LogSystemModulesEnum, sessionStorage, window } from 'src/system/log'
import { AuthApi } from 'src/api/auth'
import axios from 'axios'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.BOOT)
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.BOOT)
const logC = getLogFunc(LogLevelEnum.CRITICAL, LogSystemModulesEnum.BOOT)

let apollo

let fetchFunc
if (process.env.MODE === 'ssr') {
   fetchFunc = async (uri, options) => {
      options.url = uri
      if (options.body) options.data = options.body
      let res = await axios(options)
      if (res && res.data) res.body = res.data
      return res
   }
} else {
   fetchFunc = fetch
}

export default async ({ Vue, store, app }) => {
   try {
      let kDebug = sessionStorage.getItem('k_debug') || '0'// запросы переренаправляются на машину разработчика
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

      // // todo После выхода apollo-client 3 - выкинуть fragmentMatcher и перейти на possibleTypes
      const fragmentMatcher = new IntrospectionFragmentMatcher({
         introspectionQueryResultData
      })
      const cache = new InMemoryCache({
         addTypename: true,
         fragmentMatcher,
         dataIdFromObject: object => {
            // logD('dataIdFromObject', object)
            if (!object.__typename || !object.oid) return null
            if (possibleTypes.Object.includes(object.__typename)) {
               return object.oid
            } else {
               return object.__typename + ':' + object.oid
            } // если так не сделать - то например objectShort может перезаписать в кэше полный объект
         },
         possibleTypes,
         cacheRedirects: {
            Query: {
               objectFull: (_, args, { getCacheKey }) => getCacheKey({ oid: args.oid })
            }
         }
      })
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
      const wsApollo = new ApolloClient({
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
      logD('apollo init done')
   } catch (err) {
      logC(err)
      throw err // без apollo работать не можем!
   }
}

export { apollo }
