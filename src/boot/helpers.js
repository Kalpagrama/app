import { EventApi } from 'src/api/event'

// node rate meta
const rateMeta = [
  {name: EventApi.verbalizeRate(0.2), value: 0, valueMin: -1, valueMax: 0.2, color: 'rgba(255,26,5,0.7)', colorBackground: 'rgba(255,26,5,0.4)', order: 5},
  {name: EventApi.verbalizeRate(0.4), value: 0.25, valueMin: 0.2, valueMax: 0.4, color: 'rgba(255,221,2,0.7)', colorBackground: 'rgba(255,221,2,0.4)', order: 4},
  {name: EventApi.verbalizeRate(0.6), value: 0.5, valueMin: 0.4, valueMax: 0.6, color: 'rgba(75,172,79,0.7)', colorBackground: 'rgba(75,172,79,0.4)', order: 3},
  {name: EventApi.verbalizeRate(0.8), value: 0.75, valueMin: 0.6, valueMax: 0.8, color: 'rgba(44,85,179,0.7)', colorBackground: 'rgba(44,85,179,0.4)', order: 2},
  {name: EventApi.verbalizeRate(1), value: 1, valueMin: 0.8, valueMax: 2, color: 'rgba(113,49,164,0.7)', colorBackground: 'rgba(113,49,164,0.4)', order: 1}
]

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
  {id: ['ESSENCE', 'ESSENCE'], name: 'Указать суть'},
  {id: ['ASSOCIATIVE', 'ASSOCIATIVE'], name: 'Ассоциация'},
  {id: ['CAUSE', 'EFFECT'], name: 'Причина - Следствие'},
  {id: ['PROBLEM', 'SOLUTION'], name: 'Проблема - Решение'},
  {id: ['FROM', 'TO'], name: 'До - После'},
  {id: ['FAKE', 'DISPROOF'], name: 'Фейк - Опровержение'},
  {id: ['FACT', 'PROOF'], name: 'Факт - Подтверждение'},
  {id: ['QUESTION', 'ANSWER'], name: 'Вопрос - Ответ'},
]

const nodeItemType = (type) => {
  // console.log('nodeItemType:type', type)
  return nodeItemTypes.find(t => t.id === type)
}

export default async ({ Vue, store: storeVue, router: VueRouter }) => {
  Vue.prototype.$rateMeta = rateMeta
  Vue.prototype.$nodeItemTypes = nodeItemTypes
  Vue.prototype.$nodeItemType = nodeItemType
  Vue.prototype.$nodeItemTypesPairs = nodeItemTypesPairs
}
