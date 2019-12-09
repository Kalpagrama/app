import { apolloProvider } from 'boot/apollo'
import {router} from 'boot/main'
import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'
const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.VUEX)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.VUEX)
const logW = getLogFunc(LogLevelEnum.WARNING, LogModulesEnum.VUEX)

export const init = async (context) => {
  // if (context.state.initialized) throw new Error('events state initialized already')
  if (context.state.initialized) return
  logD('user init')
  context.commit('init')
}
export const logout = async (ctx) => {
  logD('@logout start')
  let { data: { logout } } = await apolloProvider.clients.apiApollo.mutate({
    mutation: gql`
      mutation logout {
        logout
      }
    `
  })
  localStorage.removeItem('ktoken')
  localStorage.removeItem('ktokenExpires')
  router.push('/login')
  logD('@logout done')
}

export const logining = async (ctx) => {
}
