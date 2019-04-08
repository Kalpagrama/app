import Vue from 'vue';

export default class DataProvider {
    constructor(scope, api, cb) {
        this.scope = scope;
        this.api = api;
        this.callback = cb;
    }

    requestApi(api, callback, ...args) {
        const request = api ? api(args) : this.api(args);
        const provider = this;
        const { scope } = this;

        callback = callback || this.callback;

        return new Promise((resolve) => {
            scope.$apollo.subscribe(request).subscribe({
                next: ({ data }) => {
                    const key = Object.keys(data)[0];

                    callback(data[key]);
                    resolve();
                }
            })
        });
    }

    request(...args) {
        return this.requestApi(null, null, args);
    }
}
