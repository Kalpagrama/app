import 'src/system/utils' // string.in func
function assert(cond, strError){
   if(!cond) throw new Error('dummy assert: ' + strError)
}
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const vueRoutesRegexp = /.+\/(auth|feeds|welcome|settings|user|node|joint|sphere|trends|content|notifications|messages|workspace.*)(\/|\?|$).*/

function makeRoutePath(object){
   if (!object) return '/'
   assert(object.type, '!object.type')
   assert(object.oid, '!object.oid')
   let res
   if (object.type === 'NODE') res = `/node/${object.oid}`
   else if (object.type.in('VIDEO', 'IMAGE')) res = `/content/${object.oid}`
   else if (object.type === 'USER') res = `/user/${object.oid}`
   else if (object.type.in('WORD', 'SENTENCE', 'CHAR')) res = `/sphere/${object.oid}`
   return res
}

export { makeRoutePath, wait, vueRoutesRegexp }
