
export const init = async (context, user) => {
  if (context.getters.initialized) throw new Error('events state initialized already')
  context.dispatch('log/debug', ['auth', 'user init', user], { root: true })
  context.commit('init', user)
  return user
}
