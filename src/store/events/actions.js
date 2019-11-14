import { apolloProvider } from 'boot/apollo'
import { fragments } from 'schema/index'

export const init = async (context, userEvents) => {
  // if (context.getters.initialized) throw new Error('events state initialized already')
  if (context.getters.initialized) return
  context.dispatch('log/debug', ['events', 'init', userEvents], { root: true })

  const observerError = apolloProvider.clients.wsApollo.subscribe({
    client: 'wsApollo',
    query: gql`
      subscription error {
        error {
          operation
          code
          message
        }
      }
    `
  })
  const observerProgress = apolloProvider.clients.wsApollo.subscribe({
    client: 'wsApollo',
    query: gql`
      subscription progress {
        progress {
          action
          progress
        }
      }
    `
  })
  const observerEvent = apolloProvider.clients.wsApollo.subscribe({
    client: 'wsApollo',
    query: gql`
      ${fragments.eventFragment}
      subscription event {
        event {...eventFragment}
      }
    `
  })
  const observerWsEvent = apolloProvider.clients.wsApollo.subscribe({
    client: 'wsApollo',
    query: gql`
      ${fragments.WSContentFragment} ${fragments.WSFragmentFragment} ${fragments.WSBookmarkFragment} ${fragments.WSTagFragment} ${fragments.WSDraftFragment}
      subscription wsEvent {
        wsEvent {
          type
          object{
            name
            uid
            ... on WSBookmark{...WSBookmarkFragment}
            ... on WSContent{...WSContentFragment}
            ... on WSDraft{...WSDraftFragment}
            ... on WSTag{...WSTagFragment}
            ... on WSFragment{...WSFragmentFragment}
          }
        }
      }
    `
  })

  observerError.subscribe({
    next: ({ data: { error } }) => {
      context.dispatch('log/debug', ['events', `EVENT error`, error], { root: true })
      context.commit('stateSet', ['error', error])
    },
    error: (error) => {
      context.dispatch('log/error', `EVENT error error ${error}`, { root: true })
    }
  })
  observerProgress.subscribe({
    next: ({ data: { progress } }) => {
      context.dispatch('log/debug', ['events', `EVENT progress`, progress], { root: true })
      context.commit('stateSet', ['progress', progress])
    },
    error: (error) => {
      context.dispatch('log/error', `EVENT progress error ${error}`, { root: true })
    }
  })
  observerEvent.subscribe({
    next: ({ data: { event } }) => {
      context.dispatch('log/debug', ['events', `EVENT event`, event], { root: true })
      if (event.type === 'NODE_CREATED') context.commit('stateSet', ['nodeCreated', event])
      else if (event.type === 'NODE_DELETED') context.commit('stateSet', ['nodeDeleted', event])
      else if (event.type === 'NODE_RATED') context.commit('stateSet', ['nodeRated', event])
    },
    error: (error) => {
      context.dispatch('log/error', `EVENT event error ${error}`, { root: true })
    }
  })
  observerWsEvent.subscribe({
    next: ({ data: { wsEvent } }) => {
      context.dispatch('log/debug', ['events', `EVENT wsEvent`, wsEvent], { root: true })
    },
    error: (error) => {
      context.dispatch('log/error', `EVENT wsEvent error ${error}`, { root: true })
    }
  })

  context.commit('init', userEvents)
  return userEvents
}
