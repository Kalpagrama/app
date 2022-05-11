import { boot } from 'quasar/wrappers'
import { EventApi } from 'src/api/event'
import { assert } from 'src/system/common/utils'
import differenceWith from 'lodash/differenceWith'
import { RxCollectionEnum } from 'src/system/rxdb'
import { Platform, Screen } from 'quasar'
import { computed, reactive } from 'vue'

// node rate meta
const rateMeta = [
  {name: EventApi.verbalizeRate(0.2), value: 0, valueMin: 0, valueMax: 0.2, colorName: 'red-8', color: 'rgba(244,67,53,0.7)', colorBackground: 'rgba(244,67,53,0.4)', order: 5},
  {name: EventApi.verbalizeRate(0.4), value: 0.25, valueMin: 0.2, valueMax: 0.4, colorName: 'amber-8', color: 'rgba(255,193,6,0.7)', colorBackground: 'rgba(255,193,6,0.4)', order: 4},
  {name: EventApi.verbalizeRate(0.6), value: 0.5, valueMin: 0.4, valueMax: 0.6, colorName: 'green-8', color: 'rgba(76,175,79,0.7)', colorBackground: 'rgba(76,175,79,0.4)', order: 3},
  {name: EventApi.verbalizeRate(0.8), value: 0.75, valueMin: 0.6, valueMax: 0.8, colorName: 'blue-8', color: 'rgba(32,150,243,0.7)', colorBackground: 'rgba(32,150,243,0.4)', order: 2},
  {name: EventApi.verbalizeRate(1), value: 1, valueMin: 0.8, valueMax: 1, colorName: 'purple-8', color: 'rgba(156,39,176,0.7)', colorBackground: 'rgba(156,39,176,0.4)', order: 1}
]
rateMeta.checkHitRate = (rate, rateInfo) => {
  assert(rate >= 0 && rate <= 1)
  assert(rateInfo && rateInfo.valueMin >= 0 && rateInfo.valueMax <= 1)
  if (rate === 0 && rateInfo.valueMin === 0) return true
  return rate > rateInfo.valueMin && rate <= rateInfo.valueMax
}

const nodeItemTypes = [
  {id: 'ESSENCE', name: 'По сути', pair: 'ESSENCE'},
  {id: 'ASSOCIATIVE', name: 'Ассоциация', pair: 'ASSOCIATIVE'},
  // cause/effect
  {id: 'CAUSE', name: 'Причина', pair: 'EFFECT'},
  {id: 'EFFECT', name: 'Следствие', pair: 'CAUSE'},
  // problem/solution
  {id: 'PROBLEM', name: 'Проблема', pair: 'SOLUTION'},
  {id: 'SOLUTION', name: 'Решение', pair: 'PROBLEM'},
  // from/to
  {id: 'FROM', name: 'До', pair: 'TO'},
  {id: 'TO', name: 'После', pair: 'FROM'},
  // fake/disproof
  {id: 'FAKE', name: 'Фэйк', pair: 'DISPROOF'},
  {id: 'DISPROOF', name: 'Опровержение', pair: 'FAKE'},
  // fact/proof
  {id: 'FACT', name: 'Факт', pair: 'PROOF'},
  {id: 'PROOF', name: 'Подтверждение', pair: 'FACT'},
  // question/answer
  {id: 'QUESTION', name: 'Вопрос', pair: 'ANSWER'},
  {id: 'ANSWER', name: 'Ответ', pair: 'QUESTION'},
]

const nodeItemTypesPairs = [
  {id: ['ESSENCE', 'ESSENCE'], name: 'which link'},
  {id: ['ASSOCIATIVE', 'ASSOCIATIVE'], name: 'Association'},
  {id: ['CAUSE', 'EFFECT'], name: 'Cause - Effect'},
  {id: ['PROBLEM', 'SOLUTION'], name: 'Problem - Solution'},
  {id: ['FROM', 'TO'], name: 'Before - After'},
  {id: ['FAKE', 'DISPROOF'], name: 'Fake - Disproof'},
  {id: ['FACT', 'PROOF'], name: 'Fact - Proof'},
  {id: ['QUESTION', 'ANSWER'], name: 'Question - Answer'},
]

const nodeItemType = (type) => {
  // console.log('nodeItemType:type', type)
  return nodeItemTypes.find(t => t.id === type) || {name: '!NOTFOUND! type=' + type}
}

export default boot(async ({ app, router, store, ssrContext, urlPath, publicPath, redirect }) => {
  app.config.globalProperties.$rateMeta = rateMeta
  app.config.globalProperties.$getRateMeta = (rate) => {
    let res = rateMeta.find(r => rateMeta.checkHitRate(rate, r))
    assert(res)
    return res
  }
  app.config.globalProperties.$nodeItemTypes = nodeItemTypes
  app.config.globalProperties.$nodeItemType = nodeItemType
  app.config.globalProperties.$nodeItemTypesPairs = nodeItemTypesPairs
  // todo убрать эту ф-ю отсюда туда где идет работа с коллекциями
  app.config.globalProperties.$synchronizeSelectedSphereIds = async (selectedSphereIds, bookmark, collectionsModel, rxdb) => {
     assert(selectedSphereIds && bookmark && collectionsModel && rxdb)
     if (!bookmark.wsSpheres) bookmark.wsSpheres = []
     let addedSpheres = differenceWith(selectedSphereIds, bookmark.wsSpheres)
     let removedSpheres = differenceWith(bookmark.wsSpheres, selectedSphereIds)
     bookmark.wsSpheres.splice(0, bookmark.wsSpheres.length, ...selectedSphereIds)
     for (let sphereId of removedSpheres){
        let sphere = collectionsModel.wsSpheres.find(el => el.id === sphereId)
        if (sphere) {
           let indxB = sphere.wsSphereItems.findIndex(bid => bid === bookmark.id)
           if (indxB >= 0) sphere.wsSphereItems.splice(indxB, 1)
        }
     }
     for (let wsSphereId of addedSpheres) {
        // не используем collectionsModel.wsSpheres, тк при добавлении новой коллекции addCollectionToBookmark вызывается раньше, чем изменяется this.collectionsModel.wsSpheres
        let sphere = await rxdb.get(RxCollectionEnum.WS_SPHERE, wsSphereId)
        if (sphere) {
           if (!sphere.wsSphereItems) sphere.wsSphereItems = []
           if (!sphere.wsSphereItems.find(bid => bid === bookmark.id)) {
              sphere.wsSphereItems.push(bookmark.id)
              sphere.thumbUrl = bookmark.thumbUrl
           }
        }
     }
  }

  app.config.globalProperties.$screenProps = reactive({
     isDesktop: computed(() => Screen.width >= 768),
     isMobile: computed(() => Screen.width < 768),
     isMobileLarge: computed(() => Screen.width < 768 && Screen.width >= 601),
     isMobileNormal: computed(() => Screen.width < 601 && Screen.width >= 321),
     isMobileTiny: computed(() => Screen.width < 321),
     isHorizontal: computed(() => (Platform.is.mobile || Platform.is.capacitor) && Screen.width > Screen.height),
  })
})
