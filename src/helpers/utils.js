export default {

    getAddress: (name, url = null, protocol = null) => {
        const config = process.env.APP_CONFIG
        if (!protocol && !_.isUndefined(config[name].https)) {
            if (config[name].https) {
                protocol = 'https'
            } else {
                protocol = 'https'
            }
        }
        return 'https://api.kalpagramma.com/graphql'
        // return `${protocol}://${config[name].host}${
        //      (config[name].port) ? `:${config[name].port}` : ''
        //      }${url}`
    }
}
