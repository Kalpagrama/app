/* eslint-disable */

import DataProvider from './DataProvider'
import { isUserAuthorizedApi, isUserConfirmedApi, listAuthActionsApi } from './api'
import axios from 'axios'

export default class AuthProvider extends DataProvider {
    constructor(scope) {
        super(scope, null, null)
        const self = this

        this.actions = null
        this.cacheIsAuthorized = false
        this.cacheIsConfirmed = false

        this.isAuthorized()
        this.isConfirmed()
    }

    async action(key) {
        if(!this.actions){
          this.actions = await this.requestApi(listAuthActionsApi)
        }
        console.log(key, JSON.stringify(this.actions))
        const found = this.actions.filter(el => el.action === key)
        console.log('found:', found)
        console.log('found[0]:', found[0])
        return found[0]

    }

/*  checkAutorized() {
        this.cacheIsAuthorized = this.requestApi(isUserAuthorizedApi)
    } */

    checkAutorized() {
        return this.requestApi(isUserAuthorizedApi)
    }


    checkConfirmed() {
        this.cacheIsConfirmed = this.requestApi(isUserConfirmedApi)
    }

    isAuthorized(force = false) {
        if (force) this.checkAutorized()
        return this.cacheIsAuthorized
    }

    isConfirmed(force = false) {
        if (force) this.checkConfirmed()
        return this.cacheIsConfirmed
    }

    async login(method, params = undefined) {
        let action = await this.action(method)
        if (method === 'LOGIN_EMAIL') {
            let event = axios.get(action.url, {
                params: {
                    login: params.email,
                    password: params.password
                }
            })
            return event;
        } else if (method === 'LOGIN_PHONE') {
            console.log('LOGIN_PHONE recieved!!!!!')
            console.log(action)
            console.log(params, 'Номер который приходит')
            let event = axios.get(action.url, {
                params: {
                    login: params
                }
            })
            return event;
        } else {
            return action.url
        }
    }

    logout() {

    }

    confirm() {
    }

    restore() {
    }

}
/*

 beforeMount() {
 this.auth = new AuthProvider(this);
 this.auth.login().TEHN(this.onLogin); // я закончил Максим спасибо. Мне нужно еще раз это все посмотреть
 // Но в целом я понял задумку

 // до того как ты начнешь писать я хотел бы услышать как ты организуешь класс
 /!*то есть будешь ли выносить какие то сущноти
 для этого настоятельно рекомендую тебе составить диаграмму переходов (состояний)
 тогда ты поймешь, что и как надо делать
 Хорошо

 сейчас я тебе кину ссылку где это удобно сделать
 тк задача у тебя сложная и ответственная, тебе стоит ее хорошо проработать,
 и  потом будет очень легко писать
 Хорошо

 я кину сслку в слак
 если найду
 *!/
 }


 {
 "action": "LOGIN_VK",
 "url": "https://oauth.vk.com/authorize?client_id=6911684&display=mobile&redirect_uri=https://api.kalpagramma.com/auth/login/vk&scope=email&response_type=code&v=5.92"
 },
 {
 "action": "LOGIN_EMAIL",
 "url": "https://api.kalpagramma.com/auth/login/local",
 params: ['email', 'password'],
 },

 */
