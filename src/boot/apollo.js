const debug = require('debug')('[boot]:apollo')
debug.enabled = true
import { Notify } from 'quasar'
import { ApolloClient } from 'apollo-client'
import { createHttpLink } from 'apollo-link-http'
import { WebSocketLink } from 'apollo-link-ws'
import { onError } from 'apollo-link-error'
import { split, ApolloLink } from 'apollo-link'
import { InMemoryCache, IntrospectionFragmentMatcher } from 'apollo-cache-inmemory'
import introspectionQueryResultData from '../schema/graphql.schema.json'
import { getMainDefinition } from 'apollo-utilities'
// import { setContext } from 'apollo-link-context'
import { createUploadLink } from 'apollo-upload-client'
// import { persistCache } from 'apollo-cache-persist'
import VueApollo from 'vue-apollo'
import axios from 'axios'
var apollo

export default async ({ Vue, store, app }) => {
  debug('start')
  // axios
  axios.interceptors.request.use((request) => {
    // Do something with response data
    debug('axios request', request)
    let d = localStorage.getItem('kdebug')
    if (d) request.headers['X-Kalpagramma-debug'] = d
    return request
  }, (error) => {
    // Do something with response error
    // localStorage.removeItem('kdebug')
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
  // let mode = 'offline'
  // if (mode === 'offline') return
  // apollo
  Vue.use(VueApollo)
  // let SERVICES_URL = process.env.SERVICES_URL || 'https://dev.kalpagramma.com/graphql'
  let SERVICES_URL = 'https://test.kalpagramma.com/graphql'
  debug('SERVICES_URL', SERVICES_URL)
  store.commit('auth/state', ['SERVICES_URL', SERVICES_URL])
  let { data: {data: {services}}, error } = await axios.post(SERVICES_URL, {query: `query { services }`})
  if (error) {
    debug('error', error)
    localStorage.removeItem('kdebug')
  }
  debug('services', services)
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
  const fragmentMatcher = new IntrospectionFragmentMatcher({
    introspectionQueryResultData
  })
  const cache = new InMemoryCache({
    addTypename: true,
    fragmentMatcher,
    // dataIdFromObject: object => object.oid || null
  })
  // persistCache({
  //   cache,
  //   storage: localStorage
  // })
  // if (localStorage['apollo-cache-persist']) {
  //   let cachedData = JSON.parse(localStorage['apollo-cache-persist'])
  //   cache.restore(cachedData)
  // }
  // default client
  const defaultClient = new ApolloClient({
    link: createHttpLink({
      uri: linkHttp,
      fetch (uri, options) {
        debug('FETCH HTTP')
        const token = localStorage.getItem('ktoken')
        const d = localStorage.getItem('kdebug')
        if (token) options.headers['Authorization'] = token
        if (d) options.headers['X-Kalpagramma-debug'] = d
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
                reconnect: true,
                connectionParams: () => {
                    debug('FETCH WS')
                    return {
                        Authorization: localStorage.getItem('ktoken'),
                        'X-Kalpagramma-debug': localStorage.getItem('kdebug')
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
        const token = localStorage.getItem('ktoken')
        const d = localStorage.getItem('kdebug')
        if (token) options.headers['Authorization'] = token
        if (d) options.headers['X-Kalpagramma-debug'] = d
        return fetch(uri, options)
      }
    }),
    cache
  })
  // provider
  const provider = new VueApollo({
    defaultClient: defaultClient,
    clients: {
      defaultClient,
      upload,
      ws
    }
  })
  app.apolloProvider = provider
  apollo = defaultClient
  debug('done')
}

export { apollo }
