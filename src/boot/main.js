import { getLogFunc, LogLevelEnum, LogSystemModulesEnum } from 'src/boot/log'
const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.BOOT)
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.BOOT)
const logC = getLogFunc(LogLevelEnum.CRITICAL, LogSystemModulesEnum.BOOT)
// import VueYandexMetrika from 'vue-yandex-metrika'

import { LoadingBar, Screen, date } from 'quasar'
import { TweenMax } from 'gsap'
import VueObserveVisibility from 'vue-observe-visibility'
import VueVirtualScroller from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
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

var router

export default async ({ Vue, store: storeVue, router: VueRouter }) => {
  try {
    if (!window.stores) window.stores = {}
    router = VueRouter
    Vue.use(VueMasonry)
    // Vue.use(VueYandexMetrika, {
    //   id: 60818698,
    //   router: router,
    //   // env: process.env.NODE_ENV
    //   // other options
    // })
    // Vue.use(Viewer)
    Vue.use(VueVirtualScroller)
    Vue.use(VueObserveVisibility)
    Vue.prototype.$wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))
    Vue.prototype.$axios = axios
    // quasar stuff
    // Screen.setSizes({ xs: 600, sm: 900, md: 1260, lg: 1600, xl: 1900 })
    LoadingBar.setDefaults({
      color: 'green',
      size: '4px',
      position: 'top'
    })
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
    Vue.prototype.$nodeRateTitle = (val) => {
      if (val <= 0.2) return 'Очень далеко'
      else if (val <= 0.4) return 'Ну такое'
      else if (val <= 0.6) return 'Где-то рядом'
      else if (val <= 0.8) return 'Близко'
      else return 'Прямо в точку!'
    }
    Vue.directive('kalpa-click-outside', {
      bind: function (el, binding, vnode) {
        el.clickOutsideEvent = function (event) {
          // here I check that click was outside the el and his childrens
          if (!(el === event.target || el.contains(event.target))) {
            // and if it did, call method provided in attribute value
            vnode.context[binding.expression](event);
          }
        }
        document.body.addEventListener('click', el.clickOutsideEvent)
      },
      unbind: function (el) {
        document.body.removeEventListener('click', el.clickOutsideEvent)
      },
    })
    Vue.component('kalpaLinker', () => import('components/kalpa_linker/index.vue'))
    Vue.component('kalpaConnect', () => import('components/kalpa_connect/index.vue'))
    Vue.component('nodeLite', () => import('components/node_lite/index.vue'))
    Vue.component('nodeFeed', () => import('components/node_feed/index.vue'))
    Vue.component('nodeMini', () => import('components/node_mini/index.vue'))
    Vue.component('linkFeed', () => import('components/link_feed/index.vue'))
    Vue.component('listMasonry', () => import('components/list_masonry'))
    Vue.component('listMiddle', () => import('components/list_middle'))
    Vue.component('listSlider', () => import('components/list_slider/index.vue'))
    Vue.component('listHorizontal', () => import('components/list_horizontal/index.vue'))
    Vue.component('kalpaLogo', () => import('components/kalpa_logo/index.vue'))
    Vue.component('kalpaMenu', () => import('components/kalpa_menu/index.vue'))
    Vue.component('kalpaMenuMobile', () => import('components/kalpa_menu_mobile/index.vue'))
    Vue.component('kalpaLoader', () => import('components/kalpa_loader/index.vue'))
    Vue.component('kalpaFollow', () => import('components/kalpa_follow/index.vue'))
    Vue.component('userAvatar', () => import('components/user_avatar/index.vue'))
    // content
    Vue.component('contentSearch', () => import('components/content_search/index.vue'))
    Vue.component('wsNodeEditor', () => import('components/ws_node_editor/index.vue'))
    Vue.component('wsNodeItem', () => import('components/ws_node_item/index.vue'))
    Vue.component('wsContentItem', () => import('components/ws_content_item/index.vue'))
    // spheres
    Vue.component('wsSphereItem', () => import('components/ws_sphere_item/index.vue'))
    Vue.component('wsSphereFinder', () => import('components/ws_sphere_finder/index.vue'))
    Vue.component('wsSphereEditor', () => import('components/ws_sphere_editor/index.vue'))
  } catch (err) {
    logC(err)
    throw err
  }
}

export { time, router }
