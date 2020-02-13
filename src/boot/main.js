import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'
const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.BOOT)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.BOOT)

const debug = require('debug')('[boot]:main')
debug.enabled = true

import { LoadingBar, date, Notify } from 'quasar'
import { TweenMax } from 'gsap'
import VueObserveVisibility from 'vue-observe-visibility'
import 'viewerjs/dist/viewer.css'
import Viewer from 'v-viewer'

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
    Vue.use(Viewer)
    Vue.use(VueObserveVisibility)
    Vue.prototype.$wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))
    LoadingBar.setDefaults({
      color: '#52b156',
      size: '2px',
      position: 'top'
    })
    // TODO: memory leak with tweenmax
    Vue.prototype.$tween = TweenMax
    Vue.prototype.$date = (ts, format) => {
      return date.formatDate(ts, format || 'YYYY.MM.DD', {
        dayNames: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
        monthNames: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']
      })
    }
    // sync(store, router, { moduleName: 'route' })
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
    Vue.prototype.$deleteTypename = function (obj) {
      let round = (obj) => {
        if (obj.__typename) delete obj.__typename
        for (const k in obj) {
          if (obj[k] === Object(obj[k])) round(obj[k])
        }
      }
      round(obj)
      return obj
    }
    Vue.prototype.$isInteger = (num) => {
      return (num ^ 0) === num
    }
    // layout
    // Vue.component('kPage', () => import('components/k_page'))
    // Vue.component('kMenuDesktop', () => import('components/k_menu_desktop'))
    // Vue.component('kMenuMobile', () => import('components/k_menu_mobile'))
    // Vue.component('kSplit', () => import('components/k_split'))
    // Vue.component('kColls', () => import('components/k_colls'))
    // Vue.component('kCollsTabs', () => import('components/k_colls_tabs'))
    // Vue.component('kCollsNew', () => import('components/k_colls_new'))
    // node
    Vue.component('node', () => import('components/node'))
    // Vue.component('nodeLoader', () => import('components/node_loader'))
    Vue.component('nodeList', () => import('components/node_list'))
    // Vue.component('nodeDialog', () => import('components/k_node_dialog'))
    // dialogs
    // Vue.component('kDialogMini', () => import('components/k_dialog_mini'))
    // Vue.component('kDialogBottom', () => import('components/k_dialog_bottom'))
    // Vue.component('kDialogTutorial', () => import('components/k_dialog_tutorial'))
    // Vue.component('kInvite', () => import('components/k_invite'))
    // helpers
    // Vue.component('kSpinner', () => import('components/k_spinner'))
    Vue.component('kLogo', () => import('components/k_logo'))
    // Vue.component('anvil', () => import('components/k_icons/anvil'))
    // Vue.component('kImg', () => import('components/k_img'))
    // kalpa
    Vue.component('kalpaAction', () => import('components/kalpa/action'))
    // Vue.component('kalpaColls', () => import('components/kalpa/colls'))
    // Vue.component('kalpaIcon', () => import('components/kalpa/icon'))
    Vue.component('kalpaLoader', () => import('components/kalpa/loader'))
    Vue.component('kalpaButtons', () => import('components/kalpa/buttons'))
    Vue.component('kalpaLogo', () => import('components/kalpa/logo'))
    Vue.component('kalpaMenuDesktop', () => import('components/kalpa/menudesktop'))
    Vue.component('kalpaMenuMobile', () => import('components/kalpa/menumobile'))
    Vue.component('kalpaSpinner', () => import('components/kalpa/spinner'))
    Vue.component('kalpaTutorial', () => import('components/kalpa/tutorial'))
    // new
    Vue.component('wsMenu', () => import('components/workspace/ws_menu'))
    Vue.component('compositionEditor', () => import('components/node/composition_editor'))
    Vue.component('compositionFinder', () => import('components/node/composition_finder'))
    Vue.component('composition', () => import('components/node/composition'))
    // Vue.component('nodeListByte', () => import('components/node/list_byte'))
  } catch (err) {
    logE(err)
  }
}

export { time, router }
