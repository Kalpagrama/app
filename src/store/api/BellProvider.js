import DataProvider from './DataProvider'
import { bellApi } from './api'

export default class BellProvider extends DataProvider {
    constructor(scope) {
        super(scope, bellApi)
    }

    request() {
        return this.requestApi(null)
    }
}
