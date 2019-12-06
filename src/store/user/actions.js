import assert from 'assert'

import { apolloProvider } from 'boot/apollo'

// todo переместить текущего пользователя в objects
export const init = async (context) => {
  if (context.state.initialized) return
  context.commit('init', context.rootState.objects.currentUser)
  return true
}
