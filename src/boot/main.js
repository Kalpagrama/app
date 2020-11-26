import { getLogFunc, LogLevelEnum, LogSystemModulesEnum } from 'src/boot/log'
const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.BOOT)
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.BOOT)
const logC = getLogFunc(LogLevelEnum.CRITICAL, LogSystemModulesEnum.BOOT)

import { Screen, date } from 'quasar'
import { TweenMax } from 'gsap'
import VueObserveVisibility from 'vue-observe-visibility'
import VueMasonry from 'vue-masonry-css'
import axios from 'axios'

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
    Vue.use(VueMasonry)
    Vue.use(VueObserveVisibility)
    Vue.prototype.$wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))
    Vue.prototype.$axios = axios
    // quasar stuff
    // Screen.setSizes({ xs: 600, sm: 900, md: 1260, lg: 1600, xl: 1900 })

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
    // global components
    Vue.component('nodeFeed', () => import('components/node_feed/index.vue'))
    // Vue.component('nodeMini', () => import('components/node_mini/index.vue'))
    // Vue.component('jointFeed', () => import('components/joint_feed/index.vue'))
    // Vue.component('listMasonry', () => import('components/list_masonry'))
    Vue.component('listMiddle', () => import('components/list_middle'))
    // Vue.component('listSlider', () => import('components/list_slider/index.vue'))
    // Vue.component('listHorizontal', () => import('components/list_horizontal/index.vue'))
    // // user
    Vue.component('userAvatar', () => import('components/user_avatar/index.vue'))
    // kalpa
    // Vue.component('kalpaFinder', () => import('components/kalpa_finder/index.vue'))
    Vue.component('kalpaBookmark', () => import('components/kalpa_bookmark/index.vue'))
    Vue.component('kalpaShare', () => import('components/kalpa_share/index.vue'))
    Vue.component('kalpaLogo', () => import('components/kalpa_logo/index.vue'))
    Vue.component('kalpaLoader', () => import('components/kalpa_loader/index.vue'))
    Vue.component('kalpaMenuActions', () => import('components/kalpa_menu_actions/index.vue'))
    // workspace
    // Vue.component('wsSearch', () => import('components/ws_search/index.vue'))
    // Vue.component('wsNodeItem', () => import('components/ws_node_item/index.vue'))
    // Vue.component('wsContentItem', () => import('components/ws_content_item/index.vue'))
    // spheres
    // Vue.component('wsSphereItem', () => import('components/ws_sphere_item/index.vue'))
    // Vue.component('wsSphereEditor', () => import('components/ws_sphere_editor/index.vue'))
  } catch (err) {
    logC(err)
    throw err
  }
}

export { time }
