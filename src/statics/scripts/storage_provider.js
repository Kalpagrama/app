// легкая обертка для https://github.com/apollographql/apollo-cache-persist#storage-providers
// localForage слишком много весит
import { Store, get, set, keys, del, clear } from 'src/statics/scripts/idb-keyval/idb-keyval.mjs'
const gqlPersistStore = new Store('gqlPersistStore', 'cache')
export default {
  clear() {
    return clear(gqlPersistStore);
  },
  getItem(key) {
    return get(key, gqlPersistStore);
  },
  setItem(key, value) {
    return set(key, value, gqlPersistStore);
  },
  keys() {
    return keys(gqlPersistStore);
  },
  remove(key) {
    return del(key, gqlPersistStore);
  },
  removeItem(key) {
    return del(key, gqlPersistStore);
  }
};
