import { apollo } from 'src/boot/apollo'
import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'
import { router } from 'boot/main'
import { checkUpdate, clearCache, update } from 'src/system/service_worker'
import assert from 'assert'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.VUEX)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.VUEX)
const logW = getLogFunc(LogLevelEnum.WARNING, LogModulesEnum.VUEX)

export const init = async (context) => {
  if (context.state.initialized) return
  logD('auth init')
  const fetchItemFunc = async () => {
    let { data: { authInfo } } = await apollo.clients.auth.query({
      client: 'apiApollo',
      query: gql`
        query {
          authInfo {
            userIsAuthorized
            userIsConfirmed
            userOid
          }
        }
      `
    })
    logD('auth fetch complete! ', authInfo)
    return { item: authInfo, actualAge: 'zero' }
  }

  let authInfo = await context.dispatch('cache/get', { key: 'authInfo', fetchItemFunc }, { root: true })
  if (authInfo && authInfo.userIsConfirmed){
    context.commit('init', authInfo)
    logD('auth init done!')
  } else logD('auth init fails!', authInfo)
}
export const inviteEmail = async (context, email) => {
  logD('@invite start')
  let { data: { inviteEmail } } = await apollo.clients.auth.mutate({
    mutation: gql`
      mutation inviteEmail ($email: String!){
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
      mutation inviteUrl{
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
        mutation logout($token: String) {
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
      await router.push('/auth')
      await update()
    }
  }
  logD('@logout done')
}
export const loginEmail = async (context, [email, inviteCode]) => {
  logD('@loginEmail start')
  let { data: { loginEmail: { token, expires, role } } } = await apollo.clients.auth.mutate({
    mutation: gql`
      mutation loginEmail ($email: String!, $inviteCode: String){
        loginEmail(email: $email, inviteCode: $inviteCode){
          token
          expires
          role
        }
      }
    `,
    variables: {
      email,
      inviteCode
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
      mutation loginPhone ($phone: String!, $inviteCode: String){
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
export const loginPassword = async (context, { login, password, inviteCode }) => {
  logD('@loginPassword start')
  let { data: { login: { token, expires, role } } } = await apollo.clients.auth.mutate({
    mutation: gql`
      mutation login ($login: String!, $password: String!, $inviteCode: String){
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
      inviteCode
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
      mutation codeConfirmEmail ($code: String!) {
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
