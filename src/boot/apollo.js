import Vue from 'vue'
import { ApolloClient } from 'apollo-client'
// import { createHttpLink } from 'apollo-link-http'
import { Notify } from 'quasar'
import { InMemoryCache, IntrospectionFragmentMatcher } from 'apollo-cache-inmemory'
import { onError } from 'apollo-link-error'
import VueApollo from 'vue-apollo'
// Subscribe
import { split, ApolloLink } from 'apollo-link'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'
// Upload

import { createUploadLink } from 'apollo-upload-client'

// use yarn gql for generate schsema
import introspectionQueryResultData from 'src/schema/graphql.schema.json'

const fragmentMatcher = new IntrospectionFragmentMatcher({
    introspectionQueryResultData
})
// init
import utils from 'src/helpers/utils'

const CONFIG = process.env.APP_CONFIG

// Install the vue plugin
Vue.use(VueApollo)

export default ({ vue, store, app }) => {
    // Create the subscription websocket link
    // const wsLink = new WebSocketLink({
    //     uri: utils.getAddress('backend', CONFIG.graphql.socket, CONFIG.graphql.wss ? 'wss' : 'ws'),
    //     options: {
    //         reconnect: true
    //     }
    // })

    // Error handler
    const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
        if (graphQLErrors) {
            graphQLErrors.map(({ message, locations, path }) => vue.$log.warn(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`))
        }
        Notify.create({
            message: 'Произошла ошибка при обращении к серверу',
            icon: 'warning',
            color: 'red',
            detail: graphQLErrors ? graphQLErrors[0].message : 'Произошла непредвиденная ошибка',
            textColor: 'black',
            position: 'top-right'
        })

        if (networkError) {
            console.error(networkError)
            // vue.$log.warn(`[Network error]: ${networkError}`)
        }
    })

    // Upload
    const uploadLink = createUploadLink({
        uri: utils.getAddress('backend', CONFIG.graphql.path),
        // includeExtensions: true,
        // headers: {
        //   'X-Session-Token': store.state.app.user.auth.token
        // },
        fetch: (uri, options) => {
            if (store.state.app) options.headers['X-Session-Token'] = store.state.app.user.auth.token
            return fetch(uri, options)
        }
    })

    // Using the ability to split links, you can send data to each link
    // depending on what kind of operation is being sent
    const fullLink = split(
        // split based on operation type
        ({ query }) => {
            const { kind, operation } = getMainDefinition(query)
            return kind === 'OperationDefinition' &&
                operation === 'subscription'
        },
        // wsLink,
        uploadLink // httpLink
    )

    // Create link
    const link = ApolloLink.from([
        errorLink,
        fullLink
    ])

    // Create the apollo client
    const apolloClient = new ApolloClient({
        link: link,
        cache: new InMemoryCache({ fragmentMatcher }),
        connectToDevTools: true
    })

    // Create a provider
    const apolloProvider = new VueApollo({
        defaultClient: apolloClient
    })

    app.provide = apolloProvider.provide()
}

// export {apolloClient, apolloProvider}
