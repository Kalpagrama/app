/* eslint-disable */

import DataProvider from './DataProvider'
import {
    confirmPhoneApi,
    isUserAuthorizedApi,
    isUserConfirmedApi,
    listAuthActionsApi,
    loginEmailApi,
    loginPhoneApi,
    refreshTokenApi
} from './query/api-query';
import axios from 'axios'
import { urlGet } from 'src/helpers/url'

export const MSG_COLOR_SUCCESS = 'green';
export const MSG_COLOR_ERROR = 'red';

const ITEM_TOKEN = 'token';
const ITEM_ROLE = 'role';
const ITEM_EXPIRES = 'expires';
const ITEM_STRATEGY = 'strategy';
const ITEM_PARAMS = 'params';

const ROLE_GUEST = 'GUEST';
const ROLE_RESETER = 'RESETER';
const ROLE_MEMBER = 'MEMBER';

const PREFIX = 'ap.';

export default class AuthProvider extends DataProvider {
    constructor(scope) {
        super(scope, null, null)

        this.actions = null

        // Првоерка переданных параметров внешней авторизации
        this.checkUrlParams();

        if (this.token) {
            // console.log('=== found TOKEN', this.token);
            this.refresh().catch((...args) => {
                // console.log('=== REFRESH ERRORR!!!!!', args);
                return this.checkAutorized.bind(this);
            }).then((data) => {
                if (!data) return this.checkAutorized();
            })
        }
        else {
            // scope.$router.push('/auth/login');
        }
    }

    checkUrlParams() {
        if (urlGet('token')) {
            const tempToken = urlGet('token');
            const tempRole = urlGet('role');
            const tempExp = urlGet('expires');

            this.cache(ITEM_TOKEN, tempToken);
            this.cache(ITEM_ROLE, tempRole);
            this.cache(ITEM_EXPIRES, tempExp);

            location.href = location.origin;
        }
    }

    async action(key) {
        if(!this.actions){
          this.actions = await this.requestApi(listAuthActionsApi)
        }

        console.log(key, JSON.stringify(this.actions));

        const found = this.actions.filter(el => el.action === key);

        // console.log('found:', found);
        // console.log('found[0]:', found[0]);

        return found[0]

    }

    checkAutorized() {
        // console.log('checking');
        return this.requestApi(isUserAuthorizedApi)
    }

    checkConfirmed() {
        this.cacheIsConfirmed = this.requestApi(isUserConfirmedApi)
    }

    // fixme Под вопросом, есть геттер authorized
    isAuthorized(force = false) {
        if (force) this.checkAutorized()
        return this.cacheIsAuthorized
    }

    // fixme Под вопросом
    isConfirmed(force = false) {
        if (force) this.checkConfirmed()
        return this.cacheIsConfirmed
    }

    async idatePhone(code) {

    }

    async logout(callback) {
        return this.requestApi(logoutApi)
            .finally(() => {
                callback && callback();
            });
    }

    async login(method, params) {
        throw 'Login method cant be used directly.';
    }

    async loginEmail(params) {
        const self = this;

        self.cache(ITEM_STRATEGY, 'Email');

        return this.requestApi(loginEmailApi, params)
            .then(self.onSuccessLogin.bind(self));
    }

    async loginPhone(params) {
        const self = this;

        self.cache(ITEM_STRATEGY, 'Phone');

        return this.requestApi(loginPhoneApi, params)
            .then(self.onSuccessLogin.bind(self));
    }

    async confirmPhone({phone, code}) {
        return this.requestApi(confirmPhoneApi, phone, code);
    }

    onSuccessLogin({expires, role, token}) {
        this.cache(ITEM_TOKEN, token);
        this.cache(ITEM_EXPIRES, expires);
        this.cache(ITEM_ROLE, role);

        // this.scope.$router.push('/home');

        return true;
    }

    logout() {
        [ITEM_TOKEN, ITEM_EXPIRES, ITEM_ROLE].forEach(el => localStorage.removeItem(PREFIX + el));
        this.scope.$router.push('/auth/login');
    }

    confirm() {
    }

    refresh() {
        const self = this;

        return this.requestApi(refreshTokenApi, this.token, this.cache(ITEM_EXPIRES), this.cache(ITEM_ROLE))
            .then(self.onSuccessLogin.bind(self));
    }

    restore() {
    }

    notify(message, color = MSG_COLOR_SUCCESS) {
        this.scope.$q.notify({ message, color });
    }

    notifyError(message) {
        this.scope.$q.notify({ message, MSG_COLOR_ERROR });
    }

    notifySuccess(message) {
        this.scope.$q.notify({ message, MSG_COLOR_SUCCESS });
    }

    cache(name, value) {
        if (typeof value === 'undefined')
            return localStorage.getItem(PREFIX + name);
        localStorage.setItem(PREFIX + name, value)
    }

    get token() {
        return this.cache(ITEM_TOKEN);
    }

    get authorized() {
        return this.token && !this.expired;
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
