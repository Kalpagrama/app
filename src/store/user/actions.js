import assert from 'assert'

import { apolloProvider } from 'boot/apollo'

export const init = async (context, settings) => {
  // if (context.state.initialized) throw new Error('events state initialized already')
  if (context.state.initialized) return
  context.commit('init', settings)
  return true
}
