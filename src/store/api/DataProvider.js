import Vue from 'vue';

export default class DataProvider {
    constructor(scope, api, cb) {
        this.scope = scope;
        this.api = api;
        this.callback = cb;
    }

    requestApi(...args) {
        const request = this.api(args);
        const provider = this;
        const { scope } = this;

        return new Promise((resolve) => {
            scope.$apollo.subscribe(request).subscribe({
                next: ({ data }) => {
                    const key = Object.keys(data)[0];

                    provider.callback(data[key]);
                    resolve();
                }
            })
        });
    }

    request(...args) {
        return this.requestApi(args);
    }
}
