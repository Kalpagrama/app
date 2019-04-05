const GQL_API = async function (query, variables) {
    return {
        query,
        variables,
    };
};

const API_NEWS_FEED = GQL_API()
