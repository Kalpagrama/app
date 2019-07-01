const debug = require('debug')('[boot]:apollo')
debug.enabled = true
import { Notify } from 'quasar'
import { ApolloClient } from 'apollo-client'
import { createHttpLink } from 'apollo-link-http'
import { WebSocketLink } from 'apollo-link-ws'
import { onError } from 'apollo-link-error'
import { split, ApolloLink } from 'apollo-link'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { getMainDefinition } from 'apollo-utilities'
// import { setContext } from 'apollo-link-context'
import { createUploadLink } from 'apollo-upload-client'
// import { persistCache } from 'apollo-cache-persist'
import VueApollo from 'vue-apollo'
import axios from 'axios'

export default async ({ Vue, store, app }) => {
  debug('start')
  // axios
  axios.interceptors.request.use((request) => {
    // Do something with response data
    debug('axios request', request)
    // request.headers['Authorization'] = localStorage.getItem('ktoken')
    return request
  }, (error) => {
    // Do something with response error
    return Promise.reject(error)
  })
  axios.interceptors.response.use(response => {
    debug('axios response', response)
    if (response.request) {
    } else {
    }
    return response
  }, (error) => {
    return Promise.reject(error)
  })
  Vue.prototype.$axios = axios
  // apollo
  Vue.use(VueApollo)
  let SERVICES_URL = process.env.SERVICES_URL || 'http://api.kalpagramma.com/graphql'
  // debug('SERVICES_URL', SERVICES_URL)
  store.commit('auth/state', ['SERVICES_URL', SERVICES_URL])
  let { data: {data: {services}}, error } = await axios.post(SERVICES_URL, {query: `query { services }`})
  if (error) {
    debug('error', error)
  }
  // debug('services', services)
  // Error
  // const errorLink = onError(({graphQLErrors, networkError, operation}) => {
  //   Notify.create({message: 'Server ERROR', color: 'red', textColor: 'white'})
  //   if (graphQLErrors) {
  //     graphQLErrors.map((e) => {
  //       debug('graphQLError', JSON.stringify(e))
  //     })
  //   }
  //   if (networkError) {
  //     debug('onError networkError', JSON.stringify(networkError))
  //   }
  // })
  // Links
  // let linkHttp = ApolloLink.from([errorLink, data.data.services.API])
  // let linkWs = ApolloLink.from([errorLink, data.data.services.SUBSCRIPTIONS])
  // let linkUpload = ApolloLink.from([errorLink, data.data.services.UPLOAD])
  let linkHttp = services.API
  let linkWs = services.SUBSCRIPTIONS
  let linkUpload = services.UPLOAD
  store.commit('auth/state', ['AUTH_VK', services.AUTH_VK])
  // Cache
  const cache = new InMemoryCache()
  // persistCache({
  //   cache,
  //   storage: localStorage
  // })
  // if (localStorage['apollo-cache-persist']) {
  //   let cachedData = JSON.parse(localStorage['apollo-cache-persist'])
  //   cache.restore(cachedData)
  // }
  // TODO: IntrospectionFragmentMatcher
  // default client
  const defaultClient = new ApolloClient({
    link: createHttpLink({
      uri: linkHttp,
      fetch (uri, options) {
        debug('FETCH HTTP')
        options.headers['Authorization'] = localStorage.getItem('ktoken')
        return fetch(uri, options)
      }
    }),
    cache,
    connectToDevTools: true
  })
  // ws client
  const ws = new ApolloClient({
    link: new WebSocketLink({
      uri: linkWs,
      options: {
        lazy: true,
        reconnect: true,
        connectionParams: async () => {
          debug('FETCH WS')
          const token = localStorage.getItem('ktoken')
          return {
            headers: {
              Authorization: token
            }
          }
        }
      }
    }),
    cache
  })
  // upload client
  const upload = new ApolloClient({
    link: createUploadLink({
      uri: linkUpload,
      fetch (uri, options) {
        debug('FETCH UPLOAD', uri, options)
        options.headers['Authorization'] = localStorage.getItem('ktoken')
        return fetch(uri, options)
      }
    }),
    cache
  })
  // provider
  app.apolloProvider = new VueApollo({
    defaultClient: defaultClient,
    clients: {
      defaultClient,
      upload,
      ws
    }
  })
  debug('done')
}
