import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'
const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.BOOT)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.BOOT)

const debug = require('debug')('[boot]:main')
debug.enabled = true

import { LoadingBar, date, Notify } from 'quasar'
import { TweenMax } from 'gsap'
import VueObserveVisibility from 'vue-observe-visibility'
// import { sync } from 'vuex-router-sync'

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
    Vue.use(VueObserveVisibility)
    Vue.prototype.$wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))
    LoadingBar.setDefaults({
      color: '#52b156',
      size: '2px',
      position: 'top'
    })
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
    Vue.prototype.$strip = function (obj) {
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
    Vue.prototype.$nodesDistinct = function (nodes) {
      const result = []
      const map = new Map()
      for (const node of nodes) {
        if (!map.has(node.oid)) {
          map.set(node.oid, true)
          result.push(node)
        }
      }
      return result
    }
  // navigation
  Vue.prototype.$go = (options) => {
    // logD('go', options)
    store.commit('ui/stateSet', ['going', true])
    // VueRouter.replace(options)
    VueRouter.push(options)
    setTimeout(() => {
      store.commit('ui/stateSet', ['going', false])
    }, 500)
  }
  Vue.prototype.$back = () => {
    // store.commit()
  }
    // layout
    Vue.component('kPage', () => import('components/k_page'))
    Vue.component('kMenuDesktop', () => import('components/k_menu_desktop'))
    Vue.component('kMenuMobile', () => import('components/k_menu_mobile'))
    Vue.component('kSplit', () => import('components/k_split'))
    Vue.component('kColls', () => import('components/k_colls'))
    Vue.component('kCollsTabs', () => import('components/k_colls_tabs'))
    Vue.component('kCollsNew', () => import('components/k_colls_new'))
    // node
    Vue.component('node', () => import('components/node'))
    Vue.component('nodeLoader', () => import('components/node_loader'))
    Vue.component('nodeList', () => import('components/node_list'))
    Vue.component('nodeDialog', () => import('components/node_dialog'))
    // dialogs
    Vue.component('kDialogMini', () => import('components/k_dialog_mini'))
    Vue.component('kDialogBottom', () => import('components/k_dialog_bottom'))
    Vue.component('kDialogTutorial', () => import('components/k_dialog_tutorial'))
    Vue.component('kInvite', () => import('components/k_invite'))
    // helpers
    Vue.component('kSpinner', () => import('components/k_spinner'))
    Vue.component('kLogo', () => import('components/k_logo'))
    Vue.component('anvil', () => import('components/k_icons/anvil'))
  } catch (err) {
    logE(err)
  }
}

export { time, router }
