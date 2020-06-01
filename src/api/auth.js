import { apollo } from 'src/boot/apollo'
import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'
import { router } from 'src/boot/main'
import { checkUpdate, clearCache } from 'src/system/services'
import assert from 'assert'
import { rxdb } from 'src/system/rxdb'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.AUTH)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.AUTH)
const logW = getLogFunc(LogLevelEnum.WARNING, LogModulesEnum.AUTH)

let currentWebPushToken

class AuthApi {
  static async checkExpire () {
    if (localStorage.getItem('k_token_expires')) {
      let expires = localStorage.getItem('k_token_expires')
      // todo при необходимости продлить токен (если скоро истекает)
    }
  }

  static async services(servicesApollo) {
    let { data: { services } } = await servicesApollo.query({
      query: gql`query {
        services {
          authUrl
          apiUrl
          uploadUrl
          subscriptionsUrl
          oAuthUrlYandex
          oAuthUrlVk
          oAuthUrlGoogle
          oAuthUrlGithub
          oAuthUrlFacebook
        }
      }`
    })
    return services
  }

  // если токен не указан - выйдет из всех сессий
  static async logout (token) {
    let f = this.logout
    logD(f, ' start')
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
      if (!token || token === localStorage.getItem('k_token')) {
        localStorage.removeItem('k_token')
        localStorage.removeItem('k_token_expires')
        localStorage.removeItem('k_user_oid')
        localStorage.removeItem('k_user_role')
        await clearCache()
        await checkUpdate()
        await router.push('/auth')
      }
    }
    logD(f, 'logout done')
  }

  static async userIdentify (userId_) {
    let f = this.userIdentify
    logD(f, 'start. userId=', userId_)
    assert(userId_)
    let { data: { userIdentify: { userId, loginType, userExist, needInvite, token, expires } } } = await apollo.clients.auth.query({
      query: gql`
        query  ($userId: String!){
          userIdentify(userId: $userId){
            userId
            loginType
            userExist
            needInvite
            token
            expires
          }
        }
      `,
      variables: {
        userId: userId_
      }
    })
    localStorage.setItem('k_token', token)
    localStorage.setItem('k_token_expires', expires)
    // setWebPushToken мог быть вызван до userIdentify
    if (currentWebPushToken) await AuthApi.setWebPushToken(currentWebPushToken)
    logD(f, 'done')
    return { userId, loginType, userExist, needInvite, token, expires }
  }

  static async userAuthenticate (password, inviteCode) {
    let f = this.userAuthenticate
    logD(f, 'start')
    let { data: { userAuthenticate: { result, role, oid, nextAttemptDate, attempts, failReason } } } = await apollo.clients.auth.query({
      query: gql`
        query ($password: String!, $inviteCode: String) {
          userAuthenticate(password: $password, inviteCode: $inviteCode){
            result
            role
            oid
            nextAttemptDate
            attempts
            failReason
          }
        }
      `,
      variables: { password, inviteCode }
    })
    localStorage.setItem('k_user_role', role)
    if (oid) localStorage.setItem('k_user_oid', oid)
    logD(f, 'done', { result, role, oid, nextAttemptDate, attempts, failReason })
    return { result, role, nextAttemptDate, attempts, failReason }
  }

  static async inviteEmail (email) {
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

  static async inviteUrl () {
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

  static async checkUserIdFree (userId) {
    let { data: { checkUserIdFree } } = await apollo.clients.auth.query({
      query: gql`
        query ($userId: String!){
          checkUserIdFree(userId: $userId)
        }
      `,
      variables: {
        userId
      }
    })
    return checkUserIdFree
  }

  // сообщит токен на сервер (при условии что тот еще не был сообщен)
  static async setWebPushToken (token) {
    let f = this.setWebPushToken
    logD(f, 'start', token)
    assert(token)
    currentWebPushToken = token
    if (!localStorage.getItem('k_token')) return
    if (localStorage.getItem('k_web_push_token') === currentWebPushToken) return // (чтобы не дергать сервер каждый раз с одим и тем же токеном)

    let { data: { setWebPushToken } } = await apollo.clients.auth.query({
      query: gql`query ($token: String!) {
        setWebPushToken (token: $token)
      }`,
      variables: { token }
    })
    localStorage.setItem('kweb_push_token', token)
    logD(f, 'complete')
  }
}

export { AuthApi }
