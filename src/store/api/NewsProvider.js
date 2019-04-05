import DataProvider from './DataProvider';

function newsApi ([from, limit, direction]) {
    const pagination = { from, limit, direction };

    return {
        query: gql`query($pagination: PaginationInput!, $preferWidth: Int!, $preferHeight: Int!) {
            newsFeed(pagination: $pagination){
                oid
                type
                name
                thumbUrl(preferWidth: $preferWidth, preferHeight:$preferHeight)
            }
        }`,
        variables: {
            pagination: pagination,
            preferWidth: 370,
            preferHeight: 420,
        }
    };
}

export const DIRECTION_FORWARD = 'forward';
export const DIRECTION_BACKWARD = 'backward';

export default class NewsProvider extends DataProvider {
    constructor(scope, cb) {
        super(scope, newsApi, cb);
        this.direction = DIRECTION_FORWARD;
    }

    request(from, limit, direction = DIRECTION_FORWARD) {
        return this.requestApi(from, limit, direction);
    }
}
