import { apollo } from 'src/boot/apollo'
import { getLogFunc, LogLevelEnum, LogSystemModulesEnum } from 'src/boot/log'
import { router } from 'src/boot/main'
import { resetLocalStorageData, loginReset, systemLogin, systemReset } from 'src/system/services'
import assert from 'assert'
import { RxCollectionEnum, rxdb } from 'src/system/rxdb'
import { Mutex } from 'src/system/rxdb/reactive'
import { fragments } from 'src/api/fragments'
import i18next from 'i18next'
import store from 'src/store/index'
import { UserApi } from 'src/api/user'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.AUTH)
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.AUTH)
const logW = getLogFunc(LogLevelEnum.WARNING, LogSystemModulesEnum.AUTH)

let currentWebPushToken
const apiMutex = new Mutex()

class AuthApi {
   static isAuthorized () {
      return !!localStorage.getItem('k_user_oid')
   }

   static getRole () {
      return localStorage.getItem('k_user_role') || 'GUEST'
   }

   static isGuest () {
      let role = localStorage.getItem('k_user_role')
      return !role || role.in('GUEST', 'UNCONFIRMED')
   }

   static checkRoleCredentials (roleMinimal) {
      let role = localStorage.getItem('k_user_role') || 'GUEST'
      logD('role = ', role, roleMinimal)
      switch (roleMinimal) {
         case 'GUEST':
            return role.in('GUEST', 'MEMBER', 'MODERATOR', 'ADMIN')
         case 'MEMBER':
            return role.in('MEMBER', 'MODERATOR', 'ADMIN')
         case 'MODERATOR':
            return role.in('MODERATOR', 'ADMIN')
         case 'ADMIN':
            return role.in('ADMIN')
         default:
            throw new Error('bad role' + roleMinimal)
      }
   }

   static async checkExpire () {
      if (localStorage.getItem('k_token_expires')) {
         let expires = localStorage.getItem('k_token_expires')
         // todo при необходимости продлить токен (если скоро истекает)
      }
   }

   static async services (servicesApollo) {
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
      const f = this.logout
      logD(f, 'start')
      const t1 = performance.now()
      try {
         await apiMutex.lock()
         if (token) {
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
         }
      } catch (err) {
         logE('error on logout! err=', err)
      } finally {
         try {
            if (!token || token === localStorage.getItem('k_token')) {
               await systemReset(true)
               window.location.reload()
            }
         } finally {
            apiMutex.release()
         }
      }
      logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
   }

   static async userIdentify (userId_) {
      const f = this.userIdentify
      logD(f, 'start. userId=', userId_)
      const t1 = performance.now()
      await loginReset()
      let { data: { userIdentify: { userId, loginType, userExist, needInvite, needConfirm, dummyUser, token, expires } } } = await apollo.clients.auth.query({
         query: gql`
             ${fragments.dummyUserFragment}
             query  ($userId: String){
                 userIdentify(userId: $userId){
                     userId
                     loginType
                     userExist
                     needInvite
                     needConfirm
                     dummyUser {
                         ...dummyUserFragment
                     }
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
      logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
      return { userId, loginType, userExist, needInvite, needConfirm, dummyUser, token, expires }
   }

   static async userIdentifyByRoute (route) {
      assert(route, '!route')
      const f = this.userIdentifyByRoute
      logD(f, 'start. route=', route)
      const t1 = performance.now()
      let token, expires, userId, loginType, needInvite, needConfirm, userExist
      if (route && route.query && route.query.token) {
         // take token from redirect url
         token = route.query.token
         expires = route.query.expires
         userId = route.query.userId
         loginType = route.query.loginType
         needInvite = route.query.needInvite
         needConfirm = route.query.needConfirm
         userExist = route.query.userExist
         await loginReset()
         localStorage.setItem('k_token', token)
         localStorage.setItem('k_token_expires', expires)
      }
      // setWebPushToken мог быть вызван до userIdentify
      if (currentWebPushToken) await AuthApi.setWebPushToken(currentWebPushToken)
      logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
      return { userId, loginType, userExist, needInvite, needConfirm, token, expires }
   }

   static async userAuthenticate (password, inviteCode) {
      const f = this.userAuthenticate
      logD(f, 'start')
      const t1 = performance.now()
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
      if (result) await systemLogin()
      logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`, {
         result,
         role,
         oid,
         nextAttemptDate,
         attempts,
         failReason
      })
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
      const f = this.setWebPushToken
      logD(f, 'start', token)
      const t1 = performance.now()
      assert(token)
      currentWebPushToken = token
      if (!localStorage.getItem('k_token')) return
      if (UserApi.isGuest()) return
      if (localStorage.getItem('k_web_push_token') === currentWebPushToken) return // (чтобы не дергать сервер каждый раз с одим и тем же токеном)

      let { data: { setWebPushToken } } = await apollo.clients.auth.query({
         query: gql`query ($token: String!) {
             setWebPushToken (token: $token)
         }`,
         variables: { token }
      })
      localStorage.setItem('k_web_push_token', token)
      logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
   }
}

export { AuthApi }
