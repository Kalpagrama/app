//import authProvider from 'app/src/store/api/DataProvider'
//
//    /*
//class Auth {
//    constructor(app) {
//        this.app = app;
//    }
//
//    async init(){
//        this.isAuth = false
//        this.isConf = false
//        // todo
//
//        this.authActions = await authProvider.getAuthActions()
//        this.isAuthorized(true)
//        this.isConfirmed(true)
//    }
//
//    ​async isAuthorized(force = false) {
//        if(!force) return this.isAuth
//        this.isAuth = await authProvider.isAuth()
//        return this.isAuth
//    }
//
//    async isConfirmed(force = false) {
//        if(!force) return this.isConf
//        this.isConf = await authProvider.isConfirmed()
//        return this.isConf
//    }
//
//      async login(METHOD, payload) {
//          // на примере ВК
//          // 1. найти в authActions url, который соответствует ключу LOGIN_VK
//           /* let urlConfirm = new URL('/auth/login/localMail', 'https://api.kalpagramma.com/')
//                 urlConfirm.searchParams.set('login', '/////&&&&::::')
//                 urlConfirm.searchParams.set('password', 'qwerty')
//                 console.debug(urlConfirm.toString()) *
//
//          let url = 'https://api.kalpagramma.com/auth/login/local?email=_____________&password=___________'
//          return await new Promise((resolve, reject) => {
//    /*          2. перейти по полученному url. Далее - будет редирект на наш сервер. В ответ на него наш сервер отправит post() с результатом операции
//              3. дождаться ответа от сервера. проанализировать его *
//              resolve(true)
//              resolve(false)
//          })
//
//      }
///*​
//  async restore(METHOD) {
///*      1. найти в authActions url, который соответствует ключу RESTORE_PASSWORD_BY_PHONE
//      2. заполнить login
//      2. перейти по полученному url. В ответ на него наш сервер отправит post() с результатом операции
//      3. дождаться ответа от сервера. проанализировать его
//      Если все ок, то вернуть true
//      Иначе - вернуть false*/
//  }
///*
//  async user() {
//      1. запросить с сервера user. Дождаться ответа. Вернуть результат
//  }
//​
//  async logout() {
//      1. найти в authActions url, который соответствует ключу LOGOUT
//      2. перейти по полученному url. В ответ на него наш сервер отправит post() с результатом операции
//      3. дождаться ответа от сервера. проанализировать его
//      Если все ок, то вернуть true
//      Иначе - вернуть false
//  }
//​
//  async confirm(code) {
//      1. найти в authActions url, который соответствует ключу CONFIRM
//      2. заполнить логин и код
//      2. перейти по полученному url. В ответ на него наш сервер отправит post() с результатом операции
//      3. дождаться ответа от сервера. проанализировать его
//      Если все ок, то вернуть true
//      Иначе - вернуть false
//  }*/
//
//}
//
