import { apollo } from 'src/boot/apollo'
import gql from 'graphql-tag'
import { getLogFunctions, LogSystemModulesEnum, performance } from 'src/boot/log'
import { systemInit, systemReset } from 'src/system/services'
import {assert} from 'src/system/common/utils'
import { RxCollectionEnum, rxdb } from 'src/system/rxdb'
import { apiCall } from 'src/api'
import { fragments } from 'src/api/fragments'
import { EventApi } from 'src/api/event'
import { LangEnum } from 'src/system/common/enums'
import { getLocale, t } from 'src/boot/i18n'

let { logD, logT, logI, logW, logE, logC } = getLogFunctions(LogSystemModulesEnum.AUTH)

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
      // todo при необходимости продлить токен (если скоро истекает)
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

   // если токен = null - выйдет из всех сессий
   static async logout (token = rxdb.getAuthToken()) {
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
         return
      }
      if (!token || token === rxdb.getAuthToken()) {
         await rxdb.clearAuthData()
      }
      logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
   }

   // после вызова этого метода - система непригодна для использования тк нет юзера. юзер устанавливается либо через userAuthenticate->systemInit, либо systemInit->userIdentify
   static async userIdentify (userId_, masterToken = null, forceSendConfirmation = false) {
      const f = AuthApi.userIdentify
      logT(f, 'start. userId= ', userId_)
      const t1 = performance.now()
      // autoInit=false - systemInit не вызывается!
      // await rxdb.clearAuthData() -- нельзя вызывать. Иначе бэкенд не сможет удалить временную сессию (ему нужен authToken)
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
                query  ($userId: String, $forceSendConfirmation: Boolean, $masterToken: String, $defaultLang: LangEnum){
                    userIdentify(userId: $userId, forceSendConfirmation: $forceSendConfirmation, masterToken: $masterToken, defaultLang: $defaultLang){
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
               forceSendConfirmation,
               defaultLang: LangEnum.ENG// getLocale()
            }
         })
         if (!token) { // сервер отверг userIdentify
            alert('cant login!' + t('сервер отверг запрос на userIdentify')) // TODO
         }
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
      await rxdb.setAuthData({authToken: res.token, dummyUser: res.dummyUser})
      await EventApi.init() // нужно для получения эвента с кодом после перехода по ссылке с почты
      logT(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
      return res
   }

   // oauth вход. После - надо вызвать userAuthenticate(а он вызовет systemInit)
   static async userIdentifyByRoute (route) {
      assert(route, '!route')
      const f = AuthApi.userIdentifyByRoute
      logD(f, 'start. route=', route)
      const t1 = performance.now()
      assert(route && route.query && route.query.token, '!route && route.query && route.query.token')
      // autoInit=false - systemInit не вызывается!
      await rxdb.clearAuthData()
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
         logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
         return { userId, loginType, userExist, needInvite, needConfirm, token, expires }
      }
      let res = await apiCall(f, cb)
      await rxdb.setAuthData({authToken: res.token})
      await EventApi.init()
      return res
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
         return { result, oid, role, nextAttemptDate, attempts, failReason }
      }
      let res = await apiCall(f, cb)
      if (res.result) {
         assert(res.oid)
         await rxdb.setAuthData({userOid: res.oid})
         // setWebPushToken мог быть вызван до userIdentify
         if (currentWebPushToken) await AuthApi.setWebPushToken(currentWebPushToken) // вне cb (иначе дедлок)
      }
      logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`, res)
      // переподключаемся (предыдущее подключение было вне авторизованной зоны.)
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
         // запомнили currentWebPushToken. вызовем setWebPushToken повторно в userAuthenticate
         if (!rxdb.getAuthToken()) return
         if (AuthApi.isGuest()) return
         // (чтобы не дергать сервер каждый раз с одим и тем же токеном)
         if (await rxdb.get(RxCollectionEnum.META, 'webPushToken') === currentWebPushToken) return

         let { data: { setWebPushToken } } = await apollo.clients.auth.query({
            query: gql`query ($token: String!) {
                setWebPushToken (token: $token)
            }`,
            variables: { token: currentWebPushToken }
         })
         await rxdb.set(RxCollectionEnum.META, { id: 'webPushToken', value: currentWebPushToken })
         logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
      }
      return await apiCall(f, cb)
   }
}

export { AuthApi, ActionEnum }
