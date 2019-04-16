/* eslint-disable */
import Vue from 'vue'

export default class DataProvider {
    constructor (scope, api) {
        if (!scope) throw "Отсутствует ссылка на this!";

        this.scope = scope
        this.api = api
    }
    requestApi (api, ...args) {
        const request = api ? api(args) : this.api(args)
        const provider = this
        const { scope } = this
// console.log('==== API', api, args);
        return new Promise((resolve) =>
            scope.$apollo.query(request).then(({ data }) => {
                    const key = Object.keys(data)[0]
                    resolve(data[key])
            }).catch((error) => {
                console.log('=== login email ERROR');
                console.log('CODE=', error.code);
                console.log('message=', error.message);
            })
        )
    }

    request (...args) {
        return this.requestApi(null, args)
    }
}
