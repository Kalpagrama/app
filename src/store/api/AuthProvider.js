import DataProvider from './DataProvider';

<<<<<<< HEAD
    function isAuthApi() {
        return {
            query: gql`query {
                query{
                    userIsAuthorized
                }
            }`
        };
    }

    function isConfirmedApi() {
        return {
            query: gql`query {
                userIsConfirmed
            }`
        };
    }

    function authActionsApi() {
        return {
            query: gql`query {
                AuthActions{
                    action
                    url
                }
            }`
        };
    }

export default class AuthProvider extends DataProvider {
    constructor(scope, api, cb) {
        super(scope, null, null);
        this.callbacks = [];
    }

    isAuth(callback) {
        return this.requestApi(isAuthApi, callback);
    }

    isConfirmed(callback) {
        return this.requestApi(isConfirmedApi, callback);
    }

    getAuthActions() {
        return new Promise((resolve, reject) => {
            this.requestApi(authActionsApi, (data, err) = > {
                if(err) reject(err)
                resolve(data)
            });
        })

    }
}
/*

beforeMount() {
    this.auth = new AuthProvider(this);
    this.auth.login(this.onLogin); // я закончил Максим спасибо. Мне нужно еще раз это все посмотреть
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
*/
=======
export default class AuthProvider extends DataProvider {
    constructor(scope) {
        super(scope, null, null);
    }
}
>>>>>>> 067acb24d6183f1961a20e525e4bdaf2abdf4422
