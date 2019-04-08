const noop = data => data;

const GQL_DISCOVER_SERVICES = gql`query{
    discoverServices {
        name
        url
    }
}`;

const GQL_IS_AUTHORIZED = gql`query{
    response: userIsAuthorized
}`;

export default class Auth {
    constructor(app) {
        this.app = app;
    }

    query(request) {
        return new Promise((resolve) => {
            this.app.$apollo.subscribe(request).subscribe({
                next: ({ data: { response } }) => {
                    resolve(response);
                }
            })
        });
    }

    async listServices() {
        const result = await this.query(GQL_DISCOVER_SERVICES);

        console.log('listServices', result);

        return result;
    }

    async login(METHOD, payload) {
        const result = await noop(payload);

        return result;
    }

    async restore(METHOD) {
        const result = await true;

        return result;
    }

    async isAuthorized() {
        const result = await true;

        return result;
    }

    async user() {
        const result = await {};

        return result;
    }

    async logout() {
        const result = await true;

        return result;
    }

    async confirm(code) {
        const result = await code;

        return result;
    }

    async isConfirmed() {
        const result = await true;

        return result;
    }
}
