
export const init = async (context, user) => {
  // if (context.state.initialized) throw new Error('events state initialized already')
  if (context.state.initialized) return
  context.dispatch('log/debug', ['auth', 'user init', user], { root: true })
  context.commit('init', user)
  return user
}
