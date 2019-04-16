import DataProvider from './DataProvider'
import { nodeFullApi } from './query/api-query';

export default class NodeProvider extends DataProvider {
    constructor (scope) {
        super(scope, nodeFullApi)
    }

    request (oid) {
        return this.requestApi(null, oid)
    }
}
