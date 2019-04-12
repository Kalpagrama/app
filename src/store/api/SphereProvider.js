import DataProvider from './DataProvider'
import { sphereApi, sphereListApi, sphereNodeListApi } from './api'

export const DIRECTION_FORWARD = 'FORWARD'
export const DIRECTION_BACKWARD = 'BACKWARD'

export default class SphereProvider extends DataProvider {
    constructor(scope) {
        super(scope, sphereApi)
        this.direction = DIRECTION_FORWARD
    }

    one(oid) {
        return this.requestApi(sphereApi, oid);
    }

    related(oid, limit = 50) {
        return this.requestApi(sphereListApi, oid, oid, limit, this.direction);
    }

    nodes(oid, limit = 50) {
        return this.requestApi(sphereNodeListApi, oid, oid, limit, this.direction);
    }
}
