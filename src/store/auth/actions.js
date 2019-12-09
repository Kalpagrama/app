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

export const logout = async (context) => {
  logD('@logout start')
  let { data: { logout } } = await apolloProvider.clients.authApollo.mutate({
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
export const loginEmail = async (context, email) => {
  logD('@loginEmail start')
  let { data: { loginEmail: { token, expires, role } } } = await apolloProvider.clients.authApollo.mutate({
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
export const loginPassword = async (context, {login, password}) => {
  logD('@loginPassword start')
  let { data: { login: { token, expires, role } } } = await apolloProvider.clients.authApollo.mutate({
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
      inviteCode: localStorage.getItem('ktokenInviteCode')
      // inviteCode: '171145051370487837'
    }
  })
  localStorage.setItem('ktoken', token)
  localStorage.setItem('ktokenExpires', expires)
  logD('@loginPassword done')
}
