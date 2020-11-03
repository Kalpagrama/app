import 'src/system/utils' // string.in func
import {rxdb} from 'src/system/rxdb'
function assert(cond, strError){
   if(!cond) throw new Error('dummy assert: ' + strError)
}
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))

function makeEventCard (event) {
   // alert('makeEventCard')
   let resultCard = { icon: '', title: 'Новое событие', description: '', items: [] }
   const cropObj = (obj) => {
      assert(obj.oid && obj.type && obj.name != null && obj.thumbUrl, 'bad obj: ' + JSON.stringify(obj))
      return { oid: obj.oid , name: obj.name, thumbUrl: obj.thumbUrl, type: obj.type }
   }
   const verbalizeObject = (obj) => {
      assert(obj.oid && obj.type && obj.name != null && obj.thumbUrl, 'bad obj: ' + JSON.stringify(obj))
      return `${verbalizeObjectType(obj)}${obj.name ? ' ' + obj.name: ''}`
   }
   const verbalizeObjectType = (obj)=>{
      assert(obj.type && obj.name != null, 'bad obj: ' + JSON.stringify(obj))
      switch (obj.type){
         case 'NODE': return 'ядро'
         case 'JOINT': return 'связь'
         case 'USER': return 'пользователь'
         case 'SPHERE':
         case 'CHAR':
         case 'WORD':
         case 'SENTENCE': return 'сфера'
         case 'AUDIO':
         case 'IMAGE':
         case 'VIDEO':
         case 'BOOK': return 'контент'
      }
   }
   const myOid = rxdb.getCurrentUser().oid
   switch (event.type) {
      case 'USER_SUBSCRIBED':
         if (event.subject.oid === myOid) {
            resultCard.items = [`вы подписались на ${verbalizeObjectType(event.object)}`, cropObj(event.object)]
         } else {
            resultCard.items = ['пользователь', cropObj(event.subject), `подписался на ${verbalizeObjectType(event.object)}`, cropObj(event.object)]
         }
         break
      case 'USER_UNSUBSCRIBED':
         if (event.subject.oid === myOid) {
            resultCard.items = [`вы отписались от ${verbalizeObjectType(event.object)}`, cropObj(event.object)]
         } else {
            resultCard.items = ['пользователь', cropObj(event.subject), `отписался от ${verbalizeObjectType(event.object)}`, cropObj(event.object)]
         }
         break
      case 'VOTED':
         if (event.subject.oid === myOid) {
            resultCard.items = [`вы проголосовали за ${verbalizeObjectType(event.object)}`, cropObj(event.object)]
         } else {
            resultCard.items = ['пользователь', cropObj(event.subject), `проголосовал за ${verbalizeObjectType(event.object)}`, cropObj(event.object)]
         }
         break
      case 'OBJECT_CREATED':
         resultCard.title = 'Создан новый объект'
         if (event.matter.reason === 'JOIN') {
            resultCard.items = ['пользователь', cropObj(event.subject), 'использовал ваше ядро для создания', cropObj(event.object)]
         }
         else if (event.subject.oid === myOid) {
            resultCard.items = [`вы создали ${verbalizeObjectType(event.object)}`, cropObj(event.object)]
         } else {
            resultCard.items = ['пользователь', cropObj(event.subject), `создал ${verbalizeObjectType(event.object)}`, cropObj(event.object)]
         }
         break
   }
   resultCard.description = resultCard.items.reduce((acc, item) => {
      acc += ` ${typeof item === 'string' ? item : `"${item.name}"`}`
      return acc
   }, '')
   return resultCard
}

function makeRoutePath(object){
   assert(object.type, '!object.type')
   assert(object.oid, '!object.oid')
   let res
   if (object.type === 'NODE') res = `/node/${object.oid}`
   else if (object.type.in('VIDEO', 'IMAGE')) res = `/content/${object.oid}`
   else if (object.type === 'USER') res = `/user/${object.oid}`
   else if (object.type.in('WORD', 'SENTENCE', 'CHAR')) res = `/sphere/${object.oid}`
   return res
}

export { makeEventCard, makeRoutePath, wait }