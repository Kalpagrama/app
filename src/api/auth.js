import { apollo } from 'src/boot/apollo'
import gql from 'graphql-tag'
import { getLogFunc, LogLevelEnum, LogSystemModulesEnum, performance } from 'src/system/log'
import { systemInit, systemReset } from 'src/system/services'
import {assert} from 'src/system/common/utils'
import { rxdb } from 'src/system/rxdb'
import { apiCall } from 'src/api'
import { fragments } from 'src/api/fragments'
import { EventApi } from 'src/api/event'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.AUTH)
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.AUTH)
const logW = getLogFunc(LogLevelEnum.WARNING, LogSystemModulesEnum.AUTH)

let currentWebPushToken

const ActionEnum = Object.freeze({
   VOTE: 'VOTE',
   PAY: 'PAY',
})

class AuthApi {
   static getRole () {
      return rxdb && rxdb.getCurrentUser && rxdb.getCurrentUser() ? rxdb.getCurrentUser().profile.role : 'GUEST'
   }

   static isGuest () {
      return AuthApi.getRole() === 'GUEST'
   }

   // проверка соответствия текущего пользователя минимальным требованиям
   static userMatchMinimalRole (roleMinimal) {
      let role = AuthApi.getRole()
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

   static hasPermitionForAction (action, object) {
      assert(action in ActionEnum)
      let hasPermition = false
      switch (action) {
         case ActionEnum.VOTE:
         case ActionEnum.PAY:
            if (object && object.author.oid === rxdb.getCurrentUser().oid) hasPermition = false
            else hasPermition = AuthApi.userMatchMinimalRole('MEMBER')
            break
         case ActionEnum.DELETE:
            if (object && object.author.oid === rxdb.getCurrentUser().oid) hasPermition = AuthApi.userMatchMinimalRole('MEMBER')
            else hasPermition = AuthApi.userMatchMinimalRole('MODERATOR')
            break
         case ActionEnum.CREATE:
            hasPermition = AuthApi.userMatchMinimalRole('MEMBER')
            break
         default:
            throw new Error('bad action: ' + action)
      }
      return hasPermition
      // if (!hasPermition) await router.push('/auth')
   }

   static async checkExpire () {
      if (localStorage.getItem('k_token_expires')) {
         let expires = localStorage.getItem('k_token_expires')
         // todo при необходимости продлить токен (если скоро истекает)
      }
   }

   // static async services () {
   //    assert(apollo.clients.services, '!apollo.clients.services')
   //    let { data: { services } } = await apollo.clients.services.query({
   //       query: gql`query {
   //           services {
   //               authUrl
   //               apiUrl
   //               uploadUrl
   //               subscriptionsUrl
   //               oAuthUrlYandex
   //               oAuthUrlVk
   //               oAuthUrlGoogle
   //               oAuthUrlApple
   //               oAuthUrlFacebook
   //           }
   //       }`
   //    })
   //    return services
   // }
   static async settings () {
      assert(apollo.clients.settings, '!apollo.clients.settings')
      let { data: { settings } } = await apollo.clients.settings.query({
         query: gql`query {
             settings{
                 services {
                     authUrl
                     apiUrl
                     uploadUrl
                     subscriptionsUrl
                     oAuthUrlYandex
                     oAuthUrlVk
                     oAuthUrlGoogle
                     oAuthUrlApple
                     oAuthUrlFacebook
                 }
                 nodeCategories{
                     lang
                     alias
                     icon
                     type
                     name
                     sphere{
                         oid
                         type
                         name
                     }
                     type
                 }
             }

         }`
      })
      return settings
   }

   // если токен не указан - выйдет из всех сессий
   static async logout (token) {
      const f = AuthApi.logout
      logD(f, 'start')
      const t1 = performance.now()
      const cb = async () => {
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
      }
      try {
         await apiCall(f, cb)
      } catch (err) {
         logE('err on logout', err)
         return await systemReset(true, true, true, true) // вне cb (иначе дедлок)
      }
      if (!token || token === localStorage.getItem('k_token')) {
         await systemReset(true, true, false, true) // вне cb (иначе дедлок)
         await systemInit()
      }
      logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
   }

   static async userIdentify (userId_, masterToken = null, forceSendConfirmation = false) {
      const f = AuthApi.userIdentify
      logD(f, 'start. userId=', userId_)
      const t1 = performance.now()
      await systemReset(true, true, false, false) // вне cb (иначе дедлок)
      const cb = async () => {
         let {
            data: {
               userIdentify: {
                  userId = null,
                  loginType = null,
                  userExist = null,
                  needInvite = null,
                  needConfirm = null,
                  hasPermanentPassword = null,
                  dummyUser = null,
                  token = null,
                  expires = null
               }
            }
         } = await apollo.clients.auth.query({
            query: gql`
                ${fragments.dummyUserFragment}
                query  ($userId: String, $forceSendConfirmation: Boolean, $masterToken: String){
                    userIdentify(userId: $userId, forceSendConfirmation: $forceSendConfirmation, masterToken: $masterToken){
                        userId
                        loginType
                        userExist
                        needInvite
                        needConfirm
                        hasPermanentPassword
                        dummyUser {
                            ...dummyUserFragment
                        }
                        token
                        expires
                    }
                }
            `,
            variables: {
               userId: userId_,
               masterToken,
               forceSendConfirmation
            }
         })
         if (!token) { // сервер отверг userIdentify
            alert('cant login!') // TODO
         }
         localStorage.setItem('k_token', token)
         localStorage.setItem('k_token_expires', expires)
         logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
         return {
            userId,
            loginType,
            userExist,
            needInvite,
            needConfirm,
            hasPermanentPassword,
            dummyUser,
            token,
            expires
         }
      }
      let res = await apiCall(f, cb)
      await EventApi.init() // нужно для получения эвента с кодом после перехода по ссылке с почты
      return res
   }

   // oauth вход
   static async userIdentifyByRoute (route) {
      assert(route, '!route')
      const f = AuthApi.userIdentifyByRoute
      logD(f, 'start. route=', route)
      const t1 = performance.now()
      assert(route && route.query && route.query.token, '!route && route.query && route.query.token')
      await systemReset(true, true, false, false) // вне cb (иначе дедлок)
      const cb = async () => {
         let token, expires, userId, loginType, needInvite, needConfirm, userExist
         // take token from redirect url
         token = route.query.token
         expires = route.query.expires
         userId = route.query.userId
         loginType = route.query.loginType
         needInvite = route.query.needInvite === 'true'
         needConfirm = route.query.needConfirm === 'true'
         userExist = route.query.userExist === 'true'
         localStorage.setItem('k_token', token)
         localStorage.setItem('k_token_expires', expires)
         logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
         return { userId, loginType, userExist, needInvite, needConfirm, token, expires }
      }
      return await apiCall(f, cb)
   }

   static async userAuthenticate (password, inviteCode) {
      const f = AuthApi.userAuthenticate
      logD(f, 'start')
      const t1 = performance.now()
      const cb = async () => {
         let {
            data: {
               userAuthenticate: {
                  result,
                  role,
                  oid,
                  nextAttemptDate,
                  attempts,
                  failReason
               }
            }
         } = await apollo.clients.auth.query({
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
            variables: { password: password || '', inviteCode }
         })
         if (oid) localStorage.setItem('k_user_oid', oid)
         return { result, role, nextAttemptDate, attempts, failReason }
      }
      let res = await apiCall(f, cb)
      if (res.result) {
         await systemInit() // вне cb (иначе дедлок)
         // setWebPushToken мог быть вызван до userIdentify
         if (currentWebPushToken) await AuthApi.setWebPushToken(currentWebPushToken) // вне cb (иначе дедлок)
      }
      logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`, res)
      // переподключаемся (предыдущее подключение было вне авторизованной зоны.)
      await EventApi.deInit()
      await EventApi.init()
      return res
   }

   static async setPermanentPassword (oldPassword, newPassword) {
      const f = AuthApi.setPermanentPassword
      logD(f, 'start')
      const t1 = performance.now()
      const cb = async () => {
         let { data: { setPermanentPassword } } = await apollo.clients.auth.query({
            query: gql`
                query setPermanentPassword($oldPassword: String, $newPassword: String!) {
                    setPermanentPassword(oldPassword: $oldPassword, newPassword: $newPassword)
                }
            `,
            variables: { oldPassword, newPassword }
         })
         let currentUser = rxdb.getCurrentUser()
         assert(currentUser && currentUser.settings, '!currentUser && currentUser.settings')
         // currentUser.settings.hasPermanentPassword = true
         logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`, setPermanentPassword)
         return setPermanentPassword
      }
      return await apiCall(f, cb)
   }

   // сообщит токен на сервер (при условии что тот еще не был сообщен)
   static async setWebPushToken (token) {
      const f = AuthApi.setWebPushToken
      logD(f, 'start', token)
      const t1 = performance.now()
      const cb = async () => {
         assert(token)
         currentWebPushToken = token
         if (!localStorage.getItem('k_token')) {
            // запомнили currentWebPushToken. вызовем setWebPushToken повторно в userAuthenticate
            return
         }
         if (AuthApi.isGuest()) {
            return
         }
         if (localStorage.getItem('k_web_push_token') === currentWebPushToken) { // (чтобы не дергать сервер каждый раз с одим и тем же токеном)
            return
         }
         let { data: { setWebPushToken } } = await apollo.clients.auth.query({
            query: gql`query ($token: String!) {
                setWebPushToken (token: $token)
            }`,
            variables: { token: currentWebPushToken }
         })
         localStorage.setItem('k_web_push_token', currentWebPushToken)
         logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
      }
      return await apiCall(f, cb)
   }
}

export { AuthApi, ActionEnum }
