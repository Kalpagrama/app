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
    // TODO: memory leak with tweenmax, switch to tween lite
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
    // node
    Vue.component('node', () => import('components/node'))
    Vue.component('nodeSaver', () => import('components/node/node_saver'))
    Vue.component('nodeEditor', () => import('components/node/node_editor'))
    Vue.component('nodeList', () => import('components/node_list'))
    Vue.component('nodeSpheres', () => import('components/node/spheres'))
    Vue.component('nodeSpheresEditor', () => import('components/node/spheres_editor'))
    // kalpa
    Vue.component('kalpaLogo', () => import('components/kalpa/logo'))
    Vue.component('kalpaAction', () => import('components/kalpa/action'))
    Vue.component('kalpaAvatar', () => import('components/kalpa/avatar'))
    Vue.component('kalpaLoader', () => import('components/kalpa/loader'))
    Vue.component('kalpaButtons', () => import('components/kalpa/buttons'))
    Vue.component('kalpaLogo', () => import('components/kalpa/logo'))
    Vue.component('kalpaMenuDesktop', () => import('components/kalpa/menudesktop'))
    Vue.component('kalpaMenuMobile', () => import('components/kalpa/menumobile'))
    Vue.component('kalpaSpinner', () => import('components/kalpa/spinner'))
    Vue.component('kalpaTutorial', () => import('components/kalpa/tutorial'))
    Vue.component('kalpaWelcome', () => import('components/kalpa/welcome'))
    // ws
    Vue.component('wsMenu', () => import('components/workspace/ws_menu'))
    // Vue.component('noteEditor', () => import('components/'))
    // composition
    Vue.component('composition', () => import('components/node/composition'))
    Vue.component('compositionList', () => import('components/node/composition_list'))
    Vue.component('compositionFinder', () => import('components/node/composition_finder'))
    Vue.component('compositionEditor', () => import('components/node/composition_editor'))
    // content
    Vue.component('content', () => import('components/node/content'))
    Vue.component('contentFinder', () => import('components/node/content_finder'))
    Vue.component('contentEditor', () => import('components/node/content_editor'))
    Vue.component('contentExplorer', () => import('components/node/content_explorer'))
  } catch (err) {
    logE(err)
  }
}

export { time, router }
