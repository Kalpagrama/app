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

// https://github.com/Norserium/vue-advanced-cropper
// https://github.com/anvaka/panzoom
const time = (sec) => {
  let hrs = ~~(sec / 3600)
  let mins = ~~((sec % 3600) / 60)
  let secs = ~~sec % 60
  // let arr = sec.toString().split('.')
  // let ms = ''
  // if (arr.length > 1) ms = arr[1]

  let result = ''
  if (hrs > 0) result += '' + hrs + ':' + (mins < 10 ? '0' : '')

  result += '' + mins + ':' + (secs < 10 ? '0' : '')
  result += '' + secs
  // if (ms !== '') result += ':' + ms.substring(0, 3)
  return result
}

export default async ({ Vue, store: storeVue, router: VueRouter }) => {
  try {
    const f = {nameExtra: 'boot::main'}
    logD(f, 'start')
    const t1 = performance.now()
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
    const nodeItemType = (type) => {
      // console.log('nodeItemType:type', type)
      return nodeItemTypes.find(t => t.id === type)
    }
    Vue.prototype.$nodeItemTypes = nodeItemTypes
    Vue.prototype.$nodeItemType = nodeItemType
    // global components
    Vue.component('nodeFeed', () => import('components/node_feed/index.vue'))
    // lists
    Vue.component('listMiddle', () => import('components/list_middle'))
    // Vue.component('listSlider', () => import('components/list_slider/index.vue'))
    // Vue.component('listHorizontal', () => import('components/list_horizontal/index.vue'))
    // user
    Vue.component('userAvatar', () => import('components/user_avatar/index.vue'))
    // kalpa
    Vue.component('kalpaBookmark', () => import('components/kalpa_bookmark/index.vue'))
    Vue.component('kalpaShare', () => import('components/kalpa_share/index.vue'))
    Vue.component('kalpaLogo', () => import('components/kalpa_logo/index.vue'))
    Vue.component('kalpaLoader', () => import('components/kalpa_loader/index.vue'))
    Vue.component('kalpaMenuActions', () => import('components/kalpa_menu_actions/index.vue'))
    logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
  } catch (err) {
    logC(err)
    throw err
  }
}

export { time }
