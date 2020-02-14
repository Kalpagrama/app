import { ApolloClient } from 'apollo-client'
import { ApolloLink } from 'apollo-link'
import { onError } from 'apollo-link-error'
import { InMemoryCache, IntrospectionFragmentMatcher } from 'apollo-cache-inmemory'
import introspectionQueryResultData from '../schema/graphql.schema.json'
import { createHttpLink } from 'apollo-link-http'
// import VueApollo from 'vue-apollo'
// import { persistCache } from 'apollo-cache-persist'
// import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client'
import { WebSocketLink } from 'apollo-link-ws'
import { createUploadLink } from 'apollo-upload-client'
import possibleTypes from 'src/statics/scripts/possibleTypes.json'
import assert from 'assert'

import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.BOOT)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.BOOT)

let apollo

export default async ({ Vue, store, app }) => {
  // Vue.use(VueApollo)
  let SERVICES_URL = (process.env.NODE_ENV === 'development' ? process.env.SERVICES_URL_DEBUG : process.env.SERVICES_URL)
  SERVICES_URL = SERVICES_URL || 'https://dev.kalpagramma.com/graphql'
  logD('process.env2=', process.env)
  logD('SERVICES_URL2=', SERVICES_URL)
  store.commit('auth/stateSet', ['SERVICES_URL', SERVICES_URL])

  const errLink = onError(({ operation, response, graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      for (let err of graphQLErrors) {
        logE('gql error', err)
        err.message = err.code + ':' + err.message
      }
    }
    if (networkError) logE('gql network error', networkError)
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
        const d = localStorage.getItem('kdebug')
        if (d) options.headers['X-Kalpagramma-debug'] = d
        return fetch(uri, options)
      }
    }),
    defaultOptions,
    cache
  })

  let { data: { services } } = await servicesApollo.query({
    query: gql`query sw_network_first_services {services}`
  })
  logD('services', services)
  let linkAuth = services.AUTH
  let linkApi = services.API
  let linkWs = services.SUBSCRIPTIONS
  let linkUpload = services.UPLOAD
  store.commit('auth/stateSet', ['AUTH_URL', services.AUTH])
  store.commit('auth/stateSet', ['AUTH_VK', services.AUTH_VK])
  const authApollo = new ApolloClient({
    link: ApolloLink.from([
      errLink,
      createHttpLink({
        uri: linkAuth,
        fetch (uri, options) {
          const token = localStorage.getItem('ktoken')
          const d = localStorage.getItem('kdebug')
          if (token) options.headers.Authorization = token
          if (d) options.headers['X-Kalpagramma-debug'] = d
          return fetch(uri, options)
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
          const token = localStorage.getItem('ktoken')
          const d = localStorage.getItem('kdebug')
          if (token) options.headers.Authorization = token
          if (d) options.headers['X-Kalpagramma-debug'] = d
          return fetch(uri, options)
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
      errLink,
      new WebSocketLink({
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
          const token = localStorage.getItem('ktoken')
          const d = localStorage.getItem('kdebug')
          if (token) options.headers.Authorization = token
          if (d) options.headers['X-Kalpagramma-debug'] = d
          return fetch(uri, options)
        }
      })
    ]),
    defaultOptions,
    cache
  })
  apollo = {
    cache,
    clients: {
      auth: authApollo,
      api: apiApollo,
      upload: uploadApollo,
      ws: wsApollo
    }
  }
  logD('apollo init done')
}

export { apollo }
