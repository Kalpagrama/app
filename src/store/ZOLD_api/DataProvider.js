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

        return new Promise((resolve, reject) => {
                return scope.$apollo.query(request).then(({ data }) => {
                    const key = Object.keys(data)[0]
                    resolve(data[key])
                }).catch(reject);
            }
        )
    }

    request (...args) {
        return this.requestApi(null, args)
    }
}