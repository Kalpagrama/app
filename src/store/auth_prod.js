export default class Auth {
    constructor(){
        1. запросить с сервера authActions и запомнить их
        2. вызвать isAuthorized(true)
        3. вызвать isConfirmed(true)
    }

    async login(METHOD, payload) {
        // на примере ВК
        1. найти в authActions url, который соответствует ключу LOGIN_VK
        2. перейти по полученному url. Далее - будет редирект на наш сервер. В ответ на него наш сервер отправит post() с результатом операции
        3. дождаться ответа от сервера. проанализировать его
        Если все ок, то вернуть true
        Иначе - вернуть false
    }

    async restore(METHOD) {
        1. найти в authActions url, который соответствует ключу RESTORE_PASSWORD_BY_PHONE
        2. заполнить login
        2. перейти по полученному url. В ответ на него наш сервер отправит post() с результатом операции
        3. дождаться ответа от сервера. проанализировать его
        Если все ок, то вернуть true
        Иначе - вернуть false
    }

    async isAuthorized(force = false) {
        0. Если force == false, то вернуть this.isAuth
        1. запросить с сервера userIsAuthorized
        2. дождаться ответа
        3. запомнить результат в this.isAuth
        4. вернуть this.isAuth
    }
    async  isConfirmed(force = false) {
        0. Если force == false, то вернуть this.isConf
        1. Если isAuthorized() == false, то вернуть false
        2. Если isAuthorized == true, то запросить с сервера userIsConfirmed. Дожтдаться ответа
        3. запомнить результат в this.isConf
        4. вернуть this.isConf
    }

    async  user() {
        1. запросить с сервера user.  Дождаться ответа. Вернуть результат
    }

    async logout() {
        1. найти в authActions url, который соответствует ключу LOGOUT
        2. перейти по полученному url. В ответ на него наш сервер отправит post() с результатом операции
        3. дождаться ответа от сервера. проанализировать его
        Если все ок, то вернуть true
        Иначе - вернуть false
    }

    async confirm(code) {
        1. найти в authActions url, который соответствует ключу CONFIRM
        2. заполнить логин и код
        2. перейти по полученному url. В ответ на него наш сервер отправит post() с результатом операции
        3. дождаться ответа от сервера. проанализировать его
        Если все ок, то  вернуть true
        Иначе - вернуть false
    }

}
