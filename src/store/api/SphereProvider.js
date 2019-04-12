import DataProvider from './DataProvider'
import { sphereApi, sphereListApi } from './api'

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

    list(oid, from, limit, direction = DIRECTION_BACKWARD) {
        return this.requestApi(sphereListApi, oid, from, limit, direction);
    }
}
