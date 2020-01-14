// import { ApolloClient } from 'apollo-client'
// import { InMemoryCache, IntrospectionFragmentMatcher } from 'apollo-cache-inmemory'
// import introspectionQueryResultData from '../schema/graphql.schema.json'
// import { createHttpLink } from 'apollo-link-http'
// import VueApollo from 'vue-apollo'
// import { persistCache } from 'apollo-cache-persist'
import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client'
import { WebSocketLink } from 'apollo-link-ws'
import { createUploadLink } from 'apollo-upload-client'
import possibleTypes from 'src/statics/scripts/possibleTypes.json'
import assert from 'assert'

import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.BOOT)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.BOOT)

let apollo

export default async ({ Vue, store, app }) => {
  try {

  } catch (err) {
    logE(err)
  }

  // axios.interceptors.request.use((request) => {
  //   // Do something with response data
  //   logD('axios request', request)
  //   let d = localStorage.getItem('kdebug')
  //   if (d) request.headers['X-Kalpagramma-debug'] = d
  //   return request
  // }, (error) => {
  //   // Do something with response error
  //   // localStorage.removeItem('kdebug')
  //   return Promise.reject(error)
  // })
  // axios.interceptors.response.use(response => {
  //   logD('axios response', response)
  //   if (response.request) {
  //   } else {
  //   }
  //   return response
  // }, (error) => {
  //   return Promise.reject(error)
  // })
  // Vue.prototype.$axios = axios
  // let mode =   'offline'
  // if (mode === 'offline') return
  // apollo

  // Vue.use(VueApollo)
  let SERVICES_URL = (process.env.NODE_ENV === 'development' ? process.env.SERVICES_URL_DEBUG : process.env.SERVICES_URL)
  // SERVICES_URL = SERVICES_URL || 'https://test.kalpagramma.com/graphql'
  logD('process.env=', process.env)
  logD('SERVICES_URL=', SERVICES_URL)
  store.commit('auth/stateSet', ['SERVICES_URL', SERVICES_URL])

  // // todo После выхода apollo-client 3 - выкинуть fragmentMatcher и перейти на possibleTypes
  // const fragmentMatcher = new IntrospectionFragmentMatcher({
  //   introspectionQueryResultData
  // })
  const cache = new InMemoryCache({
    addTypename: true,
    // fragmentMatcher,
    dataIdFromObject: object => {
      // logD('dataIdFromObject', object)
      if (!object.__typename || !object.oid) return null
      if (possibleTypes.Object.includes(object.__typename)) return object.oid
      else return object.__typename + ':' + object.oid // если так не сделать - то например objectShort может перезаписать в кэше полный объект
    },
    possibleTypes,
    cacheRedirects: {
      Query: {
        objectFull: (_, args, { getCacheKey }) => getCacheKey({ oid: args.oid })
      }
    }
  })
  // // ОЧЕНЬ!!! неоптимальная реализация. при каждом изменении сериализуется весь кэш и записывается в 1 item
  // await persistCache({
  //   cache,
  //   storage: window.localStorage, // StorageProvider,
  //   maxSize: 1048576 * 10, // Maximum size of cache to persist (in bytes). Defaults to 1048576 (1 MB). For unlimited cache size, provide false.
  //   debug: true
  // });

  const servicesApollo = new ApolloClient({
    link: createHttpLink({
      uri: SERVICES_URL,
      fetch (uri, options) {
        const d = localStorage.getItem('kdebug')
        if (d) options.headers['X-Kalpagramma-debug'] = d
        return fetch(uri, options)
      }
    }),
    cache
  })

  let { data: { services } } = await servicesApollo.query({
    query: gql`query sw_network_first_services {services}`
  })
  logD('services', services)
  let linkAuth = services.AUTH
  let linkHttp = services.API
  let linkWs = services.SUBSCRIPTIONS
  let linkUpload = services.UPLOAD
  store.commit('auth/stateSet', ['AUTH_URL', services.AUTH])
  store.commit('auth/stateSet', ['AUTH_VK', services.AUTH_VK])
  const authApollo = new ApolloClient({
    link: createHttpLink({
      uri: linkAuth,
      fetch (uri, options) {
        const token = localStorage.getItem('ktoken')
        const d = localStorage.getItem('kdebug')
        if (token) options.headers.Authorization = token
        if (d) options.headers['X-Kalpagramma-debug'] = d
        return fetch(uri, options)
      }
      // useGETForQueries: true
    }),
    cache
  })
  const apiApollo = new ApolloClient({
    link: createHttpLink({
      uri: linkHttp,
      fetch (uri, options) {
        const token = localStorage.getItem('ktoken')
        const d = localStorage.getItem('kdebug')
        if (token) options.headers.Authorization = token
        if (d) options.headers['X-Kalpagramma-debug'] = d
        return fetch(uri, options)
      }
      // useGETForQueries: true
    }),
    cache,
    connectToDevTools: true
  })
  const wsApollo = new ApolloClient({
    link: new WebSocketLink({
      uri: linkWs,
      options: {
        minTimeout: 6000,
        reconnect: true,
        lazy: true,
        connectionParams: () => {
          return {
            Authorization: localStorage.getItem('ktoken'),
            'X-Kalpagramma-debug': localStorage.getItem('kdebug')
          }
        }
      }
    }),
    cache
  })
  const uploadApollo = new ApolloClient({
    link: createUploadLink({
      uri: linkUpload,
      fetch (uri, options) {
        const token = localStorage.getItem('ktoken')
        const d = localStorage.getItem('kdebug')
        if (token) options.headers.Authorization = token
        if (d) options.headers['X-Kalpagramma-debug'] = d
        return fetch(uri, options)
      }
    }),
    cache
  })
  // apollo = new VueApollo({
  //   defaultClient: apiApollo,
  //   clients: {
  //         auth: authApollo,
  //         api: apiApollo,
  //         upload: uploadApollo,
  //         ws: wsApollo
  //   }
  // })
  apollo = {
    cache,
    clients: {
      auth: authApollo,
      api: apiApollo,
      upload: uploadApollo,
      ws: wsApollo
    }
  }
  // app.apolloProvider = apollo
  logD('apollo init done')
}

export { apollo }
