import DataProvider from './DataProvider'
import { uploadContentFileApi, uploadContentUrlApi } from './mutation/api-mutation'


export default class UploadProvider extends DataProvider {
    constructor(scope) {
        super(scope)
    }

    uploadFile () {
      return this.requestApi(uploadContentFileApi, )
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
