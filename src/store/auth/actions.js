import { apollo } from 'src/boot/apollo'
import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'
import { router } from 'boot/main'
import { checkUpdate, clearCache, update } from 'src/system/service_worker'
import assert from 'assert'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.VUEX)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.VUEX)
const logW = getLogFunc(LogLevelEnum.WARNING, LogModulesEnum.VUEX)

export const init = async (context) => {
  // if (context.state.initialized) throw new Error('events state initialized already')
  if (context.state.initialized) return
  logD('auth init')
  const fetchItemFunc = async () => {
    let { data: { userIsAuthorized, userIsConfirmed, user } } = await apollo.clients.auth.query({
      client: 'apiApollo',
      query: gql`
        query sw_network_first_userCheck {
          userIsAuthorized
          userIsConfirmed
          user { oid }
        }
      `
    })
    return { item: { userIsAuthorized, userIsConfirmed, user }, actualAge: 'zero' }
  }

  let { userIsAuthorized, userIsConfirmed, user } = await context.dispatch('cache/get', { key: 'userCheck', fetchItemFunc }, { root: true })
  assert(user.oid)
  context.commit('init', { userIsAuthorized, userIsConfirmed, userOid: user.oid })
  logD('auth init done!')
}
export const inviteEmail = async (context, email) => {
  logD('@invite start')
  let { data: { inviteEmail } } = await apollo.clients.auth.mutate({
    mutation: gql`
      mutation sw_network_only_inviteEmail ($email: String!){
        inviteEmail(email: $email)
      }
    `,
    variables: {
      email: email
    }
  })
  logD('@invite done')
  return inviteEmail
}
export const inviteUrl = async (context) => {
  logD('@invite start')
  let { data: { inviteUrl } } = await apollo.clients.auth.mutate({
    mutation: gql`
      mutation sw_network_only_inviteUrl{
        inviteUrl
      }
    `
  })
  logD('@invite done')
  return inviteUrl
}
export const logout = async (context, token) => {
  logD('@logout start')
  try {
    let { data: { logout } } = await apollo.clients.auth.mutate({
      mutation: gql`
        mutation sw_network_only_logout($token: String) {
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
    // context.commit('user/deleteUserSession', {token, userOid: context.rootState.auth.userOid}, { root: true })
    // let currentToken = localStorage.getItem('ktoken').split('::')[0]
    if (!token || token === localStorage.getItem('ktoken')) {
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
  let { data: { loginEmail: { token, expires, role } } } = await apollo.clients.auth.mutate({
    mutation: gql`
      mutation sw_network_only_loginEmail ($email: String!, $inviteCode: String){
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
  let { data: { loginPhone: { token, expires, role } } } = await apollo.clients.auth.mutate({
    mutation: gql`
      mutation sw_network_only_loginPhone ($phone: String!, $inviteCode: String){
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
  let { data: { login: { token, expires, role } } } = await apollo.clients.auth.mutate({
    mutation: gql`
      mutation sw_network_only_login ($login: String!, $password: String!, $inviteCode: String){
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
  let { data: { confirm: { result, nextAttemptDate, attempts, failReason } } } = await apollo.clients.auth.mutate({
    client: 'authApollo',
    mutation: gql`
      mutation sw_network_only_codeConfirmEmail ($code: String!) {
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
