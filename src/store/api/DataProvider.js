/* eslint-disable */

import Vue from 'vue'

export default class DataProvider {
    constructor (scope, api) {
        this.scope = scope
        this.api = api
        //this.callback = cb;
    }

    requestApi (api, ...args) {
        const request = api ? api(args) : this.api(args)
        const provider = this
        const { scope } = this

        return new Promise((resolve) => {
            scope.$apollo.subscribe(request).subscribe({
                next: ({ data }) => {
                    const key = Object.keys(data)[0]
                    resolve(data[key])
                }
            })
        })
    }

    request (...args) {
        return this.requestApi(null, args)
    }
}
