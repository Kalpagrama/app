import { ApolloClient } from 'apollo-client'
import { createHttpLink } from 'apollo-link-http'
import { WebSocketLink } from 'apollo-link-ws'
import { InMemoryCache, IntrospectionFragmentMatcher } from 'apollo-cache-inmemory'
import introspectionQueryResultData from '../schema/graphql.schema.json'
// import { setContext } from 'apollo-link-context'
import { createUploadLink } from 'apollo-upload-client'
// import { persistCache } from 'apollo-cache-persist'
import VueApollo from 'vue-apollo'
import axios from 'axios'
import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'
const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.BOOT)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.BOOT)

let apolloProvider

// todo remove axios
export default async ({ Vue, store, app }) => {
  try {

  } catch (err) {
    logE(err)
  }

  axios.interceptors.request.use((request) => {
    // Do something with response data
    logD('axios request', request)
    let d = localStorage.getItem('kdebug')
    if (d) request.headers['X-Kalpagramma-debug'] = d
    return request
  }, (error) => {
    // Do something with response error
    // localStorage.removeItem('kdebug')
    return Promise.reject(error)
  })
  axios.interceptors.response.use(response => {
    logD('axios response', response)
    if (response.request) {
    } else {
    }
    return response
  }, (error) => {
    return Promise.reject(error)
  })
  Vue.prototype.$axios = axios
  // let mode = 'offline'
  // if (mode === 'offline') return
  // apollo
  Vue.use(VueApollo)
  let AUTH_URL = process.env.AUTH_URL || 'https://dev.kalpagramma.com/graphql'
  // let AUTH_URL = 'https://dev.kalpagramma.com/graphql'
  // logD('AUTH_URL', AUTH_URL)
  store.commit('auth/stateSet', ['AUTH_URL', AUTH_URL])

  // Cache
  const fragmentMatcher = new IntrospectionFragmentMatcher({
    introspectionQueryResultData
  })
  const cache = new InMemoryCache({
    addTypename: true,
    fragmentMatcher
    // dataIdFromObject: object => object.oid || null
  })

  const authApollo = new ApolloClient({
    link: createHttpLink({
      uri: AUTH_URL,
      fetch (uri, options) {
        logD('FETCH HTTP')
        const token = localStorage.getItem('ktoken')
        const d = localStorage.getItem('kdebug')
        if (token) options.headers.Authorization = token
        if (d) options.headers['X-Kalpagramma-debug'] = d
        return fetch(uri, options)
      },
      // useGETForQueries: true
    }),
    cache
  })

  let { data: { services } } = await authApollo.query({
    query: gql`query sw_cache_services {services}`
  })
  // logD('services', services)
  let linkHttp = services.API
  let linkWs = services.SUBSCRIPTIONS
  let linkUpload = services.UPLOAD
  store.commit('auth/stateSet', ['AUTH_VK', services.AUTH_VK])
  const apiApollo = new ApolloClient({
    link: createHttpLink({
      uri: linkHttp,
      fetch (uri, options) {
        logD('FETCH HTTP')
        const token = localStorage.getItem('ktoken')
        const d = localStorage.getItem('kdebug')
        if (token) options.headers.Authorization = token
        if (d) options.headers['X-Kalpagramma-debug'] = d
        return fetch(uri, options)
      },
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
          logD('FETCH WS')
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
        logD('FETCH UPLOAD', uri, options)
        const token = localStorage.getItem('ktoken')
        const d = localStorage.getItem('kdebug')
        if (token) options.headers.Authorization = token
        if (d) options.headers['X-Kalpagramma-debug'] = d
        return fetch(uri, options)
      }
    }),
    cache
  })
  apolloProvider = new VueApollo({
    defaultClient: apiApollo,
    clients: {
      authApollo,
      apiApollo,
      uploadApollo,
      wsApollo
    }
  })
  app.apolloProvider = apolloProvider
  // logD('apollo init done')
}

export { apolloProvider }
