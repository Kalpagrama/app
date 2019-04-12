/* eslint-disable */

import DataProvider from './DataProvider'
import { isUserAuthorizedApi, isUserConfirmedApi, listAuthActionsApi, loginEmailApi, refreshTokenApi } from './api';
import axios from 'axios'

const MSG_COLOR_SUCCESS = 'green';
const MSG_COLOR_ERROR = 'red';

const ITEM_TOKEN = 'token';
const ITEM_ROLE = 'role';
const ITEM_EXPIRES = 'expires';
const ITEM_STRATEGY = 'strategy';
const ITEM_PARAMS = 'params';

const ROLE_GUEST = 'guest';
const ROLE_RESETER = 'reseter';
const ROLE_MEMBER = 'member';

export default class AuthProvider extends DataProvider {
    constructor(scope) {
        super(scope, null, null)

        this.actions = null

        this.checkAutorized();
        //this.refresh();
    }

    async action(key) {
        if(!this.actions){
          this.actions = await this.requestApi(listAuthActionsApi)
        }

        console.log(key, JSON.stringify(this.actions));

        const found = this.actions.filter(el => el.action === key);

        console.log('found:', found);
        console.log('found[0]:', found[0]);

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

    async logout() {
        return this.requestApi(logoutApi)
            .finally(() => {

            });
    }

    async login(method, params) {
        let action = await this.action(method)
        if (method === 'LOGIN_PHONE') {
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

    async loginEmail(params) {
        const self = this;

        self.cache(ITEM_STRATEGY, 'loginEmail');

        this.requestApi(loginEmailApi, params)
            .then(self.onSuccessLogin.bind(self))
            /*
            .then(({expires, role, token}) => {
                self.cache(ITEM_TOKEN, token);
                self.cache(ITEM_EXPIRES, expires);
                self.cache(ITEM_ROLE, role);

                self.scope.$router.push('/home');
            })
            */
            .catch((error) => {
                self.notify(error, MSG_COLOR_ERROR);
            })
    }

    async loginPhone(params) {
        this.login('LOGIN_PHONE', params)
            .then((data) => {
                console.log('LOGIN_PHONE RESULT', data);
                scope.$router.push('/home');
            })
            .catch((error) => {
                this.notify(error, MSG_COLOR_ERROR);
            })
    }

    onSuccessLogin({expires, role, token}) {
        debugger;

        console.log('===========', this);
        this.cache(ITEM_TOKEN, token);
        this.cache(ITEM_EXPIRES, expires);
        this.cache(ITEM_ROLE, role);

        this.scope.$router.push('/home');
    }

    confirm() {
    }

    refresh() {
        const self = this;

        this.requestApi(refreshTokenApi).then(self.onSuccessLogin.bind(self));
    }

    restore() {
    }

    notify(message, color = MSG_COLOR_SUCCESS) {
        this.scope.$q.notify({ message, color });
    }

    cache(name, value) {
        const prefix = 'ap.';
        if (typeof value === 'undefined')
            return localStorage.getItem(prefix + name);
        localStorage.setItem(prefix + name, value)
    }

    get token() {
        return this.cache(ITEM_TOKEN);
    }

    get confirmed() {
        return this.cache(ITEM_ROLE) === ROLE_MEMBER;
    }

    get expired() {
        const value = this.cache(ITEM_EXPIRES);

        return !value || (+value < Date.now() / 1000) ;
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
