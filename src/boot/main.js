import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'
const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.BOOT)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.BOOT)
// import VueYandexMetrika from 'vue-yandex-metrika'

import { LoadingBar, date } from 'quasar'
import { TweenMax } from 'gsap'
import VueObserveVisibility from 'vue-observe-visibility'
import VueMasonry from 'vue-masonry-css'
// import Vue from 'vue'
// window.Vue = null
// import VueRx from 'vue-rx'
// Vue.use(VueRx)

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

var router

export default async ({ Vue, store, router: VueRouter }) => {
  try {
    router = VueRouter
    Vue.use(VueMasonry)
    // VueRx(Vue)
    // Vue.use(VueYandexMetrika, {
      //   id: 60818698,
      //   router: router,
      //   // env: process.env.NODE_ENV
      //   // other options
      // })
    Vue.use(VueObserveVisibility)
    Vue.prototype.$wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))
    // LoadingBar.setDefaults({
    //   color: 'purple',
    //   size: '50px',
    //   position: 'top'
    // })
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
    // node
    Vue.component('node', () => import('components/node/index.vue'))
    Vue.component('composition', () => import('components/node/composition_new'))
    // editors
    Vue.component('nodeEditor', () => import('components/node_editor'))
    Vue.component('compositionEditor', () => import('components/node/composition_editor'))
    Vue.component('contentEditor', () => import('components/content_editor'))
    // Vue.component('chainEditor', () => import('components/chain_editor'))
    // workspace
    Vue.component('wsItems', () => import('components/workspace/ws_items'))
    Vue.component('wsItemFinder', () => import('components/workspace/ws_item_finder'))
    Vue.component('wsContentCreator', () => import('components/workspace/ws_content_creator'))
    Vue.component('wsContentEditor', () => import('components/workspace/ws_content_editor'))
    Vue.component('wsContentList', () => import('components/workspace/ws_content_list'))
    Vue.component('wsItemSaver', () => import('components/workspace/ws_item_saver'))
    Vue.component('wsFinderSpheres', () => import('components/workspace/ws_finder_spheres'))
    Vue.component('wsNodeEditor', () => import('components/workspace/ws_node_editor'))
    // explore
    Vue.component('userExplorer', () => import('components/user_explorer'))
    Vue.component('nodeExplorer', () => import('components/node_explorer'))
    Vue.component('trendsExplorer', () => import('components/trends_explorer'))
    Vue.component('sphereExplorer', () => import('components/sphere_explorer'))
    Vue.component('sphereSpheres', () => import('components/sphere_spheres'))
    Vue.component('sphereListTop', () => import('components/sphere_list_top'))
    Vue.component('contentExplorer', () => import('components/content_explorer'))
    Vue.component('chainExplorer', () => import('components/chain_explorer'))
    // lists
    Vue.component('listMasonry', () => import('components/list_masonry'))
    Vue.component('listMiddle', () => import('components/list_middle'))
    // kalpa
    Vue.component('kalpaMenu', () => import('components/kalpa/menu'))
    Vue.component('kalpaMenuRight', () => import('components/kalpa/menu_right'))
    Vue.component('kalpaMenuFooter', () => import('components/kalpa/menu_footer'))
    Vue.component('kalpaAction', () => import('components/kalpa/action'))
    Vue.component('kalpaAvatar', () => import('components/kalpa/avatar'))
    Vue.component('kalpaButtons', () => import('components/kalpa/buttons'))
    Vue.component('kalpaLogo', () => import('components/kalpa/logo'))
    Vue.component('kalpaWelcome', () => import('components/kalpa/welcome'))
    Vue.component('kalpaLoader', () => import('components/kalpa/loader'))
    Vue.component('kalpaKeyboardEvents', () => import('components/kalpa/keyboard_events'))
    // Vue.component('kalpaSettings', () => import('components/kalpa/settings'))
  } catch (err) {
    logE(err)
  }
}

export { time, router }
