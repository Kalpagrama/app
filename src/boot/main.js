import { getLogFunc, LogLevelEnum, LogSystemModulesEnum, performance } from 'src/system/log'
const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.BOOT)
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.BOOT)
const logC = getLogFunc(LogLevelEnum.CRITICAL, LogSystemModulesEnum.BOOT)

import { Screen, date } from 'quasar'
import { TweenMax } from 'gsap'
import VueObserveVisibility from 'vue-observe-visibility'
import VueMasonry from 'vue-masonry-css'
import axios from 'axios'
import VueShowdown from 'vue-showdown'
import { EventApi } from 'src/api/event'
// import Vue from 'vue'
import VueVirtualScroller from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
// import 'tiptap/src/style.css'

// import global components
import userAvatar from 'components/user_avatar/index.vue'
import kalpaBookmark from 'components/kalpa_bookmark/index.vue'
import kalpaShare from 'components/kalpa_share/index.vue'
import kalpaLogo from 'components/kalpa_logo/index.vue'
import kalpaFinder from 'components/kalpa_finder/index.vue'
// import kalpaLoader from 'components/kalpa_loader/index.vue'
import kalpaMenuActions from 'components/kalpa_menu_actions/index.vue'
import kalpaMenuPopupGlobal from 'components/kalpa_menu_popup_global/index.vue'
import nodeFeed from 'components/node_feed/index.vue'
import composition from 'components/composition/index.vue'
// import listMiddle from 'components/list_middle/index.vue'
import listFeed from 'components/list_feed/index.vue'
import kalpaTree from 'components/kalpa_tree/index.vue'
import kalpaWelcome from 'components/kalpa_welcome/index.vue'

// image editors
// https://github.com/Norserium/vue-advanced-cropper
// https://github.com/anvaka/panzoom

const time = (sec, addSeconds = true) => {
  let hrs = ~~(sec / 3600)
  let mins = ~~((sec % 3600) / 60)
  let secs = ~~sec % 60
  // let arr = sec.toString().split('.')
  // let ms = ''
  // if (arr.length > 1) ms = arr[1]

  let result = ''
  if (hrs > 0) result += '' + hrs + ':' + (mins < 10 ? '0' : '')
  // result += '' + mins + ':' + (secs < 10 ? '0' : '')
  // result += '' + secs

  if (addSeconds) {
    result += '' + mins + ':' + (secs < 10 ? '0' : '')
    result += '' + secs
  }
  else {
    result += '' + mins
  }

  // if (ms !== '') result += ':' + ms.substring(0, 3)
  return result
}

export default async ({ Vue, store: storeVue, router: VueRouter }) => {
  try {
    const f = {nameExtra: 'boot::main'}
    logD(f, 'start')
    const t1 = performance.now()
    Vue.use(VueVirtualScroller)
    // the second parameter of Vue.use() is optional
    Vue.use(VueShowdown, {
      // set default flavor of showdown
      flavor: 'github',
      // set default options of showdown (will override the flavor options)
      options: {
        emoji: false,
      },
    })
    Vue.use(VueMasonry)
    Vue.use(VueObserveVisibility)
    Vue.prototype.$routerKalpa = new Proxy(VueRouter, {
      get (target, prop) {
        if (prop === 'back'){
          // если в истории пусто (зашли например по ссылке на контент), то переход назад приведет к выходу их приложения
          if (VueRouter.historyKalpa.length > 1) return VueRouter.back
          else return VueRouter.push.bind(target, '/') // В истории пусто. переходим на корневую страницу
        }
        let value = target[prop]
        return (typeof value === 'function') ? value.bind(target) : value // иначе - this - будет указывать на Proxy
      }
    })
    Vue.prototype.$wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))
    Vue.prototype.$axios = axios
    Vue.prototype.$tween = TweenMax
    Vue.prototype.$date = (ts, format) => {
      return date.formatDate(ts, format || 'YYYY.MM.DD', {
        dayNames: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
        monthNames: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']
      })
    }
    Vue.prototype.$time = time
    Vue.prototype.$random = function (min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min
    }
    var colors = {}
    Vue.prototype.$randomColor = function (id, opacity) {
      const r = () => Math.floor(256 * Math.random())
      if (opacity) {
        return colors[id] || (colors[id] = `rgb(${r()}, ${r()}, ${r()}, ${opacity})`)
      } else {
        return colors[id] || (colors[id] = `rgb(${r()}, ${r()}, ${r()})`)
      }
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
    Vue.prototype.$nodeItemTypes = nodeItemTypes
    Vue.prototype.$nodeItemType = nodeItemType
    Vue.prototype.$nodeItemTypesPairs = nodeItemTypesPairs
    // node rate meta
    const rateMeta = [
      {name: EventApi.verbalizeRate(0.2), value: 0, valueMin: -1, valueMax: 0.2, color: 'rgba(255,26,5,1)', colorBackground: 'rgba(255,26,5,0.5)', order: 5},
      {name: EventApi.verbalizeRate(0.4), value: 0.25, valueMin: 0.2, valueMax: 0.4, color: 'rgba(255,221,2,0.7)', colorBackground: 'rgba(255,221,2,0.5)', order: 4},
      {name: EventApi.verbalizeRate(0.6), value: 0.5, valueMin: 0.4, valueMax: 0.6, color: 'rgba(75,172,79,0.7)', colorBackground: 'rgba(75,172,79,0.5)', order: 3},
      {name: EventApi.verbalizeRate(0.8), value: 0.75, valueMin: 0.6, valueMax: 0.8, color: 'rgba(44,85,179,0.7)', colorBackground: 'rgba(44,85,179,0.5)', order: 2},
      {name: EventApi.verbalizeRate(1), value: 1, valueMin: 0.8, valueMax: 2, color: 'rgba(113,49,164,1)', colorBackground: 'rgba(113,49,164,0.5)', order: 1}
    ]
    Vue.prototype.$rateMeta = rateMeta

    // global components registration NOT ASYNC
    Vue.component('nodeFeed', nodeFeed)
    Vue.component('composition', composition)
    // Vue.component('jointFeed', jointFeed)
    // lists
    // Vue.component('listMiddle', listMiddle)
    Vue.component('listFeed', listFeed)
    // Vue.component('listSlider', listSlider)
    // Vue.component('listHorizontal', listHorizontal)
    // user
    Vue.component('userAvatar', userAvatar)
    Vue.component('kalpaBookmark', kalpaBookmark)
    Vue.component('kalpaShare', kalpaShare)
    Vue.component('kalpaLogo', kalpaLogo)
    Vue.component('kalpaFinder', kalpaFinder)
    Vue.component('kalpaMenuActions', kalpaMenuActions)
    Vue.component('kalpaMenuPopupGlobal', kalpaMenuPopupGlobal)
    Vue.component('kalpaTree', kalpaTree)
    Vue.component('kalpaWelcome', kalpaWelcome)

    logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
  } catch (err) {
    logC(err)
    throw err
  }
}

export { time }
