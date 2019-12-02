import { apolloProvider } from 'boot/apollo'
const debug = require('debug')('[auth]:actions')
debug.enabled = true

import {router} from 'boot/main'
import { logD } from 'src/boot/log'

export const init = async (context, user) => {
  // if (context.state.initialized) throw new Error('events state initialized already')
  if (context.state.initialized) return
  logD('user init', user)
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
