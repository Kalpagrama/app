import DataProvider from './DataProvider'
import { newsApi, nodeCountersApi } from './query/api-query';

export const DIRECTION_FORWARD = 'FORWARD'
export const DIRECTION_BACKWARD = 'BACKWARD'

export default class NewsProvider extends DataProvider {
    constructor (scope) {
        super(scope, newsApi)
        this.direction = DIRECTION_FORWARD
    }

    request (from, limit, direction = DIRECTION_FORWARD) {
        return this.requestApi(null, from, limit, direction)
    }

    nodeCounters(oids) {
        return this.requestApi(nodeCountersApi, oids);
    }
}
