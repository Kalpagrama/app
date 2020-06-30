import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'
const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.BOOT)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.BOOT)
// import VueYandexMetrika from 'vue-yandex-metrika'

import { LoadingBar, Screen, date } from 'quasar'
import { TweenMax } from 'gsap'
import VueObserveVisibility from 'vue-observe-visibility'
import VueVirtualScroller from 'vue-virtual-scroller'
import VueMasonry from 'vue-masonry-css'

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
    Vue.use(VueVirtualScroller)
    Vue.use(VueObserveVisibility)
    Vue.prototype.$wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))
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
    // node
    Vue.component('chain', () => import('components/chain/index.vue'))
    Vue.component('node', () => import('components/node/index.vue'))
    Vue.component('composition', () => import('components/node/composition'))
    // Vue.component('sphere', () => import('components/sphere'))
    // workspace
    // content
    Vue.component('wsContentPlayer', () => import('components/workspace/ws_content_player'))
    Vue.component('wsContentList', () => import('components/workspace/ws_content_list'))
    // Vue.component('wsContentEditor', () => import('components/workspace/ws_content_editor'))
    Vue.component('wsContentExplorer', () => import('components/workspace/ws_content_explorer'))
    // composition
    Vue.component('wsCompositionList', () => import('components/workspace/ws_composition_list'))
    Vue.component('wsCompositionEditor', () => import('components/workspace/ws_composition_editor'))
    // chain
    Vue.component('wsChainList', () => import('components/workspace/ws_chain_list'))
    Vue.component('wsChainEditor', () => import('components/workspace/ws_chain_editor'))
    // node
    Vue.component('wsNodeList', () => import('components/workspace/ws_node_list'))
    Vue.component('wsNodeEditor', () => import('components/workspace/ws_node_editor'))
    // sphere
    Vue.component('wsSphereList', () => import('components/workspace/ws_sphere_list'))
    Vue.component('wsSphere', () => import('components/workspace/ws_sphere'))
    // explore
    Vue.component('userExplorer', () => import('components/user_explorer'))
    Vue.component('nodeExplorer', () => import('components/node_explorer'))
    Vue.component('trendsExplorer', () => import('components/trends_explorer'))
    Vue.component('sphereExplorer', () => import('components/sphere_explorer'))
    Vue.component('sphereSpheres', () => import('components/sphere_spheres'))
    Vue.component('sphereListTop', () => import('components/sphere_list_top'))
    Vue.component('chainExplorer', () => import('components/chain_explorer'))
    // lists
    Vue.component('listMasonry', () => import('components/list_masonry'))
    Vue.component('listMiddle', () => import('components/list_middle'))
    Vue.component('listTable', () => import('components/list_table'))
    // kalpa
    Vue.component('kalpaLayout', () => import('components/kalpa/layout'))
    Vue.component('kalpaDebug', () => import('components/kalpa/debug'))
    Vue.component('kalpaMenu', () => import('components/kalpa/menu'))
    Vue.component('kalpaMenuRight', () => import('components/kalpa/menu_right'))
    Vue.component('kalpaMenuFooter', () => import('components/kalpa/menu_footer'))
    Vue.component('kalpaAvatar', () => import('components/kalpa/avatar'))
    Vue.component('kalpaButtons', () => import('components/kalpa/buttons'))
    Vue.component('kalpaLogo', () => import('components/kalpa/logo'))
    // Vue.component('kalpaWelcome', () => import('components/kalpa/welcome'))
    Vue.component('kalpaLoader', () => import('components/kalpa/loader'))
    Vue.component('kalpaKeyboardEvents', () => import('components/kalpa/keyboard_events'))
    Vue.component('kalpaMenuPopup', () => import('components/kalpa/menu_popup'))
    // Vue.component('kalpaSettings', () => import('components/kalpa/settings'))
  } catch (err) {
    logE(err)
  }
}

export { time, router }
