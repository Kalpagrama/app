import DataProvider from './DataProvider'
import { newsApi, objectFullApi } from './api';

export const DIRECTION_FORWARD = 'forward'
export const DIRECTION_BACKWARD = 'backward'

export default class NewsProvider extends DataProvider {
    constructor (scope) {
        super(scope, newsApi)
        this.direction = DIRECTION_FORWARD
    }

    request (from, limit, direction = DIRECTION_FORWARD) {
        return this.requestApi(null, from, limit, direction)
    }

    getInfo(oids) {
        return this.requestApi(objectFullApi, oids);
    }
}
