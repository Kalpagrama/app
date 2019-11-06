
export const init = async (state, user) => {
  if (state.getters.initialized) throw new Error('events state initialized already')
  state.dispatch('log/debug', ['auth', 'user init', user], { root: true })
  state.commit('init', user)
  return user
}
