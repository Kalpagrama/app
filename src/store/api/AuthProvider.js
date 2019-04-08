/* eslint-disable */

import DataProvider from './DataProvider';
import { isUserAuthorizedApi, isUserConfirmedApi, listAuthActionsApi } from './api';

export default class AuthProvider extends DataProvider {
    constructor(scope) {
        super(scope, null, null);

        const self = this;

        this.actions = [];
        this.cacheIsAuthorized = false;
        this.cacheIsConfirmed = false;

        this.isAuthorized(true)
        this.isConfirmed(true)

        this.requestApi(listAuthActionsApi).then((data) => {
            self.actions = data;
        });
    }

    checkAutorized() {
        this.cacheIsAuthorized = this.requestApi(isUserAuthorizedApi);
    }
    checkConfirmed() {
        this.cacheIsConfirmed= this.requestApi(isUserConfirmedApi);
    }

    isAuthorized(force = false) {
        if (force) this.checkAutorized();
        return this.cacheIsAuthorized;
    }

    isConfirmed() {
        if (force) this.checkConfirmed();
        return this.cacheIsConfirmed;
    }

 /*   login(method) {
        //return this.requestApi(loginApi);
        axios.get(URL, {parmas}).then(data => ...)
    }*/
    logout(){}
    confirm(){}
    restore(){}


    action(key) {
        const found = this.actions.filter(el => el.key === key);

        return found && found[0] || null;
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
