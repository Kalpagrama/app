import 'src/system/common/utils' // string.in func
function assert(cond, strError){
   if(!cond) throw new Error('dummy assert: ' + strError)
}
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const vueRoutesRegexp = /.+\/(\:catchAll\(\.\*\)\*|auth|help|share|ui|about|links|\*|home|welcome|settings|user|user-render|node|block|block-render|graph|node-render|cube|joint|joint-render|sphere|sphere-threads|sphere-render|trends|category|content|cover|content-render|content_book|notifications|messages|workspace.*)(\/|\?|$).*/

function makeRoutePath(object, full = false){
   let res = '/'
   if (object) {
      assert(object.type, '!object.type')
      assert(object.oid, '!object.oid')
      if (object.type === 'NODE') res = `/node/${object.oid}`
      else if (object.type === 'JOINT') res = `/joint/${object.oid}`
      else if (object.type === 'BLOCK') res = `/block/${object.oid}`
      else if (object.type.in('VIDEO', 'IMAGE')) res = `/content/${object.oid}`
      else if (object.type === 'USER') res = `/user/${object.oid}`
      else if (object.type.in('WORD', 'SENTENCE', 'CHAR')) res = `/sphere/${object.oid}`
   }
   if (full) res = (process.env.DOCKER_MACHINE_NAME.in('api-dev', 'local', 'vercel') ? process.env.ORIGIN_URL_DEBUG : process.env.ORIGIN_URL) + res
   return res
}

export { makeRoutePath, wait, vueRoutesRegexp }
