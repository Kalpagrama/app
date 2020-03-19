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
  // TODO при скором протухании токена - вызвать refreshSession
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
  let { data: { inviteEmail } } = await apollo.clients.auth.query({
    query: gql`
      query ($email: String!){
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
  let { data: { inviteUrl } } = await apollo.clients.auth.query({
    query: gql`
      query {
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
    let { data: { logout } } = await apollo.clients.auth.query({
      query: gql`
        query ($token: String) {
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

export const checkLoginFree = async (context, login) => {
  let { data: { checkLoginFree } } = await apollo.clients.auth.query({
    query: gql`
      query ($login: String!){
        checkLoginFree(login: $login)
      }
    `,
    variables: {
      login
    }
  })
  return checkLoginFree
}

export const userIdentify = async (context, userLogin) => {
  logD('@userIdentify start. userLogin=', userLogin)
  assert(userLogin)
  let { data: { userIdentify: { login, loginType, userExist, needInvite, token, expires } } } = await apollo.clients.auth.query({
    query: gql`
      query  ($login: String!){
        userIdentify(login: $login){
          login
          loginType
          userExist
          needInvite
          token
          expires
        }
      }
    `,
    variables: {
      login: userLogin
    }
  })
  localStorage.setItem('ktoken', token)
  localStorage.setItem('ktokenExpires', expires)
  logD('@userIdentify done')
  return { login, loginType, userExist, needInvite, token, expires }
}
export const userAuthenticate = async (context, {password, inviteCode}) => {
  logD('@userAuthenticate start')
  let { data: { userAuthenticate: { result, role, nextAttemptDate, attempts, failReason } } } = await apollo.clients.auth.query({
    query: gql`
      query ($password: String!, $inviteCode: String) {
        userAuthenticate(password: $password, inviteCode: $inviteCode){
          result
          role
          nextAttemptDate
          attempts
          failReason
        }
      }
    `,
    variables: { password, inviteCode }
  })
  logD('@userAuthenticate done')
  return { result, role, nextAttemptDate, attempts, failReason }
}
