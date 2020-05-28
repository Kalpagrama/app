import { apollo } from 'src/boot/apollo'
import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'
import { router } from 'src/boot/main'
import { checkUpdate, clearCache } from 'src/system/services'
import assert from 'assert'
import { rxdb } from 'src/boot/rxdb'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.AUTH)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.AUTH)
const logW = getLogFunc(LogLevelEnum.WARNING, LogModulesEnum.AUTH)

export async function checkExpire(){
  if (localStorage.getItem('ktoken_expires')){
    let expires = localStorage.getItem('ktoken_expires')
    // todo при необходимости продлить токен (если скоро истекает)
  }
}

// если токен не указан - выйдет из всех сессий
export async function logoutSession (token) {
  let f = logoutSession
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
    if (!token || token === localStorage.getItem('ktoken')) {
      localStorage.removeItem('ktoken')
      localStorage.removeItem('ktoken_expires')
      localStorage.removeItem('kuser_oid')
      localStorage.removeItem('kuser_role')
      await clearCache()
      await checkUpdate()
      await router.push('/auth')
    }
  }
  logD(f, 'logout done')
}

export async function userIdentify (userId_) {
  let f = userIdentify
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
  localStorage.setItem('ktoken', token)
  localStorage.setItem('ktoken_expires', expires)
  logD(f, 'done')
  return { userId, loginType, userExist, needInvite, token, expires }
}

export async function userAuthenticate (password, inviteCode) {
  let f = userAuthenticate
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
  localStorage.setItem('kuser_role', role)
  if (oid) localStorage.setItem('kuser_oid', oid)
  logD(f, 'done', { result, role, oid, nextAttemptDate, attempts, failReason })
  return { result, role, nextAttemptDate, attempts, failReason }
}

export async function inviteEmail (email) {
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

export async function inviteUrl () {
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

export async function checkUserIdFree (userId) {
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
