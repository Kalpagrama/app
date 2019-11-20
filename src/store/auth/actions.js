const debug = require('debug')('[auth]:actions')
debug.enabled = true

import {router} from 'boot/main'

export const init = async (context, user) => {
  // if (context.state.initialized) throw new Error('events state initialized already')
  if (context.state.initialized) return
  context.dispatch('log/debug', ['auth', 'user init', user], { root: true })
  context.commit('init', user)
  return user
}

export const logout = async (ctx) => {
  debug('@logout start')
  localStorage.removeItem('ktoken')
  localStorage.removeItem('ktokenExpires')
  router.push('/login')
  debug('@logout done')
}
