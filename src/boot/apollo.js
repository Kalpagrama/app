import { boot } from 'quasar/wrappers'
import { ApolloClient, InMemoryCache, ApolloLink, createHttpLink } from '@apollo/client/core'
import { SubscriptionClient } from 'subscriptions-transport-ws'

import { onError } from 'apollo-link-error'
import { WebSocketLink } from 'apollo-link-ws'
import { createUploadLink } from 'apollo-upload-client'

import { assert } from 'src/system/common/utils'
import isEqual from 'lodash/isEqual'
import { RxCollectionEnum, rxdb } from 'src/system/rxdb'
import { getLogFunctions, LogSystemModulesEnum, performance } from 'src/boot/log'
import { AuthApi } from 'src/api/auth'
import { systemReset } from 'src/system/services'
import { EventApi } from 'src/api/event'
let { logD, logT, logI, logW, logE, logC } = getLogFunctions(LogSystemModulesEnum.BOOT)

let apollo

export default boot(async ({
  app,
  router,
  store,
  ssrContext,
  urlPath,
  publicPath,
  redirect
}) => {
  try {
    const f = { nameExtra: 'boot::apollo' }
    logD(f, 'start')
    const t1 = performance.now()
    let fetchFunc
    fetchFunc = fetch
    if (!sessionStorage.getItem('k_debug')) sessionStorage.setItem('k_debug', '0')
    let kDebug = sessionStorage.getItem('k_debug')// запросы переренаправляются на машину разработчика
    kDebug = kDebug === '1'
    // Vue.use(VueApollo)
    logD('SERVICES_URL=' + process.env.SERVICES_URL)
    const errLink = onError(({
      operation,
      response,
      graphQLErrors,
      networkError
    }) => {
      if (graphQLErrors) {
        for (let err of graphQLErrors) {
          logE('gql error', err)
          err.message = err.code + ':' + err.message
          if (err.code === 'USER_NOT_AUTH' || err.code === 'BAD_SESSION' || err.code === 'UNCONFIRMED_LOGIN_DISABLED') {
            // alert('error on gql request: ' + JSON.stringify(err))
            AuthApi.logout()
              .then(() => {
                logW('AuthApi. before reload!')
                window.location.reload()
              })
              .catch(err => {
                logE('AuthApi.logout error. before reload', err)
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
          // AuthApi.logout()
          //    .then(() => {
          //       window.location.reload()
          //    })
          //    .catch(err => {
          //       logE('AuthApi.logout error', err)
          //       window.location.reload()
          //    })
          systemReset(true, true, true, true)
        }
      }
    })

    const errLinkWs = onError(({
      operation,
      response,
      graphQLErrors,
      networkError
    }) => {
      // для ошибок ws не делаем логаут/релоад (поскольку оно работает асинхронно)
      if (graphQLErrors) {
        for (let err of graphQLErrors) {
          logE('gql error', err)
        }
      }
      if (networkError) {
        logE('gql network error ws', networkError)
        if (networkError.message === 'bad auth token!') {
          // alert('error on gql request2: ' + JSON.stringify(networkError))
          systemReset(true, true, true, true)
        }
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
    const settingsApollo = new ApolloClient({
      link: createHttpLink({
        uri: process.env.SERVICES_URL,
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
        settings: settingsApollo, // нужно для AuthApi.services
        auth: null,
        api: null,
        upload: null,
        ws: null
      }
    }

    const onFetchFunc = async (oldVal, newVal) => {
      logD(' settings onFetchFunc...')
      if (oldVal && !isEqual(oldVal, newVal)) {
        logD('new settings received! try reload page...')
        window.location.reload() // новые данные будут подхвачены после перезагрузки
      }
    }

    let settings = await rxdb.get(RxCollectionEnum.GQL_QUERY, 'settings',
      {
        clientFirst: true,
        force: true,
        onFetchFunc
      })

    logD('settings=', settings)
    assert(settings && settings.services, '!services!!!')
    let linkAuth = settings.services.authUrl
    let linkApi = settings.services.apiUrl
    let linkWs = settings.services.subscriptionsUrl
    let linkUpload = settings.services.uploadUrl
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
    wsApollo = new ApolloClient({
      // link: wsLink,
      defaultOptions,
      cache
    })
    const client = new SubscriptionClient(linkWs, {
      minTimeout: 6000,
      reconnect: true,
      lazy: true,
      connectionParams: () => {
        let token = localStorage.getItem('k_token')
        assert(token, '!token!!! сокеты включаем только когда уже открыта сессия!')
        return {
          Authorization: token,
          'X-Kalpagrama-debug': kDebug ? 'k_debug' : ''
        }
      }
    })
    let rawLink = new WebSocketLink(client)
    // let rawLink = new WebSocketLink({
    //    uri: linkWs,
    //    options: {
    //       minTimeout: 6000,
    //       reconnect: true,
    //       lazy: true,
    //       connectionParams: () => {
    //          let token = localStorage.getItem('k_token')
    //          return {
    //             Authorization: token,
    //             'X-Kalpagrama-debug': kDebug ? 'k_debug' : ''
    //          }
    //       }
    //    }
    // })
    let wsLink = ApolloLink.from([errLinkWs, rawLink])
    wsApollo.setLink(wsLink)
    wsApollo.closeConnection = () => {
      client.close()
    }
    wsApollo.openConnection = () => {
      client.connect()
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
      settings: settingsApollo,
      auth: authApollo,
      api: apiApollo,
      upload: uploadApollo,
      ws: wsApollo
    }
    await EventApi.init()
    logT(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
  } catch (err) {
    logC(err)
    throw err // без apollo работать не можем!
  }
})

export { apollo }
