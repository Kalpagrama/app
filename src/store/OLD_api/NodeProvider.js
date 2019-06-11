import DataProvider from './DataProvider'
import { nodeFullApi, nodeFullApi2 } from './query/api-query';

export default class NodeProvider extends DataProvider {
    constructor (scope) {
        super(scope, nodeFullApi);
    }

    request (oid) {
        return this.requestApi(nodeFullApi2, oid);
    }
}
