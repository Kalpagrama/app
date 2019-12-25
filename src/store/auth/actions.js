import { apolloProvider } from 'boot/apollo'
import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'
import { router } from 'boot/main'
import { checkUpdate, clearCache, update } from 'src/system/service_worker'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.VUEX)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.VUEX)
const logW = getLogFunc(LogLevelEnum.WARNING, LogModulesEnum.VUEX)

export const init = async (context) => {
  // if (context.state.initialized) throw new Error('events state initialized already')
  if (context.state.initialized) return
  logD('auth init')
  let { data: { userIsAuthorized, userIsConfirmed } } = await apolloProvider.clients.authApollo.query({
    client: 'apiApollo',
    query: gql`
      query sw_cache_userCheck {
        userIsAuthorized
        userIsConfirmed
      }
    `,
    fetchPolicy: 'network-only'
  })
  context.commit('init', { userIsAuthorized, userIsConfirmed })
}
export const logout = async (context, token) => {
  logD('@logout start')
  try {
    let { data: { logout } } = await apolloProvider.clients.authApollo.mutate({
      mutation: gql`
        mutation sw_nocache_logout($token: String) {
          logout(token: $token)
        }
      `,
      variables: {
        token
      }
    })
  } catch (err) {
    logE('error on logout! err=', err)
  } finally {
    context.commit('objects/deleteUserSession', token, { root: true })
    let currentToken = localStorage.getItem('ktoken').split('::')[0]
    if (!token || token === localStorage.getItem('ktoken') || token === currentToken) {
      localStorage.removeItem('ktoken')
      localStorage.removeItem('ktokenExpires')
      await checkUpdate()
      await router.push('/login')
      await update()
    }
  }
  logD('@logout done')
}
export const loginEmail = async (context, email) => {
  logD('@loginEmail start')
  let { data: { loginEmail: { token, expires, role } } } = await apolloProvider.clients.authApollo.mutate({
    mutation: gql`
      mutation sw_nocache_loginEmail ($email: String!, $inviteCode: String){
        loginEmail(email: $email, inviteCode: $inviteCode){
          token
          expires
          role
        }
      }
    `,
    variables: {
      email,
      inviteCode: localStorage.getItem('ktokenInviteCode')
      // inviteCode: '171145051370487837'
    }
  })
  localStorage.setItem('ktoken', token)
  localStorage.setItem('ktokenExpires', expires)
  logD('@loginEmail done')
}
export const loginPhone = async (context, phone) => {
  logD('@loginPhone start')
  let { data: { loginPhone: { token, expires, role } } } = await apolloProvider.clients.authApollo.mutate({
    mutation: gql`
      mutation sw_nocache_loginPhone ($phone: String!, $inviteCode: String){
        loginPhone(phone: $phone, inviteCode: $inviteCode){
          token
          expires
          role
        }
      }
    `,
    variables: {
      phone,
      inviteCode: localStorage.getItem('ktokenInviteCode')
      // inviteCode: '171145051370487837'
    }
  })
  localStorage.setItem('ktoken', token)
  localStorage.setItem('ktokenExpires', expires)
  logD('@loginPhone done')
}
export const loginPassword = async (context, { login, password }) => {
  logD('@loginPassword start')
  let { data: { login: { token, expires, role } } } = await apolloProvider.clients.authApollo.mutate({
    mutation: gql`
      mutation sw_nocache_login ($login: String!, $password: String!, $inviteCode: String){
        login(login: $login, password: $password  inviteCode: $inviteCode){
          token
          expires
          role
        }
      }
    `,
    variables: {
      login,
      password,
      inviteCode: localStorage.getItem('ktokenInviteCode')
      // inviteCode: '171145051370487837'
    }
  })
  localStorage.setItem('ktoken', token)
  localStorage.setItem('ktokenExpires', expires)
  logD('@loginPassword done')
}
export const confirm = async (context, code) => {
  logD('@confirm start')
  let { data: { confirm: { result, nextAttemptDate, attempts, failReason } } } = await apolloProvider.clients.authApollo.mutate({
    client: 'authApollo',
    mutation: gql`
      mutation sw_nocache_codeConfirmEmail ($code: String!) {
        confirm(code: $code){
          result
          nextAttemptDate
          attempts
          failReason
        }
      }
    `,
    variables: {
      code
    }
  })
  logD('@confirm done')
  return { result, nextAttemptDate, attempts, failReason }
}
