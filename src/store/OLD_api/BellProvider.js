import DataProvider from './DataProvider'
import { bellApi } from './query/api-query'

export default class BellProvider extends DataProvider {
    constructor(scope) {
        super(scope, bellApi)
    }

    request() {
        return this.requestApi(null)
    }
}
