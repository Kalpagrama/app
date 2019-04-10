import DataProvider from './DataProvider'
import { bellApi } from './api'

export const LIMIT = 3;

export default class BellProvider extends DataProvider {
    constructor(scope) {
        super(scope, bellApi)
        this.limit = LIMIT;
    }

    request(limit) {
        return this.requestApi(null, limit)
    }
}
