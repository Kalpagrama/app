
import { apolloProvider } from 'boot/apollo'
import {eventFragment, WSContentFragment, WSFragmentFragment, WSDraftFragment, WSBookmarkFragment, WSTagFragment} from 'schema/index'

export const init = async (state, userEvents) => {
  if (state.getters.initialized) throw new Error('events state initialized already')
  state.dispatch('log/debug', ['events', 'init', userEvents], { root: true })

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
      ${eventFragment}
      subscription event {
        event {...eventFragment}
      }
    `
  })
  const observerWsEvent = apolloProvider.clients.wsApollo.subscribe({
    client: 'wsApollo',
    query: gql`
      ${WSContentFragment} ${WSFragmentFragment} ${WSBookmarkFragment} ${WSTagFragment} ${WSDraftFragment}
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
    next: ({data: {error}}) => {
      state.dispatch('log/error', `EVENT error ${error}`, { root: true })
    },
    error: (error) => {
      state.dispatch('log/error', `EVENT error error ${error}`, { root: true })
    }
  })
  observerProgress.subscribe({
    next: ({data: {progress}}) => {
      state.dispatch('log/debug', ['events', 'progress', progress], { root: true })
    },
    error: (error) => {
      state.dispatch('log/error', `EVENT progress error ${error}`, { root: true })
    }
  })
  observerEvent.subscribe({
    next: ({data: {event}}) => {
      state.dispatch('log/debug', `EVENT event ${event}`, { root: true })
    },
    error: (error) => {
      state.dispatch('log/error', `EVENT event error ${error}`, { root: true })
    }
  })
  observerWsEvent.subscribe({
    next: ({data: {wsEvent}}) => {
      state.dispatch('log/debug', `EVENT wsEvent ${wsEvent}`, { root: true })
    },
    error: (error) => {
      state.dispatch('log/error', `EVENT wsEvent error ${error}`, { root: true })
    }
  })

  state.commit('init', userEvents)
  return userEvents
}
