import 'src/system/utils' // string.in func
function assert(cond, strError){
   if(!cond) throw new Error('dummy assert: ' + strError)
}

function makeEventCard (event) {
   // alert('makeEventCard')
   let resultCard = { icon: '', title: 'Новое событие', description: '', items: [] }
   const cropObj = (obj) => {
      assert(obj.oid && obj.name != null && obj.thumbUrl, 'bad obj: ' + JSON.stringify(obj))
      return { oid: obj.oid, name: obj.name, thumbUrl: obj.thumbUrl, type: obj.type }
   }
   switch (event.type) {
      case 'USER_SUBSCRIBED':
         assert(event.matter, '!event.matter')
         if (event.matter.reason === 'SUBSCRIBE') {
            resultCard.items = ['пользователь', cropObj(event.subject), 'подписался на', cropObj(event.object)]
         } else if (event.matter.reason === 'AUTHOR') {
            resultCard.items = ['вы подписались на', cropObj(event.object)]
         } else throw new Error('bad matter:' + JSON.stringify(event.matter))
         break
      case 'USER_UNSUBSCRIBED':
         assert(event.matter, '!event.matter')
         if (event.matter.reason === 'SUBSCRIBE') {
            resultCard.items = ['пользователь', cropObj(event.subject), 'отписался от', cropObj(event.object)]
         } else if (event.matter.reason === 'AUTHOR') {
            resultCard.items = ['вы отписались от', cropObj(event.object)]
         } else throw new Error('bad matter:' + JSON.stringify(event.matter))
         break
      case 'VOTED':
         assert(event.matter, '!event.matter')
         if (event.matter.reason === 'SUBSCRIBE') {
            resultCard.items = ['пользователь', cropObj(event.subject), 'проголосовал за', cropObj(event.object)]
         } else if (event.matter.reason === 'AUTHOR') {
            resultCard.items = ['вы проголосовали за', cropObj(event.object)]
         } else throw new Error('bad matter:' + JSON.stringify(event.matter))
         break
      case 'OBJECT_CREATED':
         resultCard.title = 'Создан новый объект'
         assert(event.matter, '!event.matter')
         if (event.matter.reason === 'SUBSCRIBE') {
            resultCard.items = ['пользователь', cropObj(event.subject), 'создал', cropObj(event.object)]
         } else if (event.matter.reason === 'AUTHOR') {
            resultCard.items = ['вы создали', cropObj(event.object)]
         } else if (event.matter.reason === 'JOIN') {
            resultCard.items = ['пользователь', cropObj(event.subject), 'использовал ваше ядро для создания', cropObj(event.object)]
         } else throw new Error('bad matter:' + JSON.stringify(event.matter))
         break
   }
   // span.text-white {{ n.subject.name }} =>
   // span.text-white {{ n.matter.reason }} =>
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

export { makeEventCard, makeRoutePath }