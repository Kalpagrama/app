export default {
  initialized: false,
  // зеркало apollo cache (с реактивностью)
  objects: {},
  currentUser: null, // ссылается на objects[userOid]
  queryInProgress: false

}
