export default {
  initialized: false,
  // зеркало apollo cache (с реактивностью)
  // objects: {},
  // currentUser: null, // ссылается на cachedItems[userOid]
  queryInProgress: false // для последовательного выполнения запросов за объектами (не более одного запроса в единицу времени)

}
