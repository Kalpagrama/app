const debug = require('debug')('[boot]:main')
debug.enabled = true
import VueVirtualScroller from 'vue-virtual-scroller'
import { LoadingBar, date, Notify } from 'quasar'
import TweenMax from 'gsap/TweenMax'
import VueObserveVisibility from 'vue-observe-visibility'
// import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import { sync } from 'vuex-router-sync'
import 'mediaelement/build/mediaelementplayer.min.css'
import 'mediaelement/full'
import Carousel3d from 'vue-carousel-3d'
import VueMasonry from 'vue-masonry-css'
import PortalVue from 'portal-vue'

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

export default async ({ Vue, store, router }) => {
  Vue.use(PortalVue)
  Vue.use(VueMasonry)
  Vue.use(VueVirtualScroller)
  Vue.use(VueObserveVisibility)
  Vue.use(Carousel3d)
  Vue.prototype.$wait = (msg) => new Promise(resolve => setTimeout(resolve, msg))
  let banned = {'App': 1, 'mainLayout': 1}
  Vue.prototype.$log = function (...msg) {
    // if (banned[this.$options.name]) return
    const debug = require('debug')(`[${this.$options.name}] `)
    debug.enabled = true
    debug(...msg)
  }
  LoadingBar.setDefaults({
    color: 'primary',
    size: '1px',
    position: 'top'
  })
  Vue.prototype.$tween = TweenMax
  Vue.prototype.$date = (ts, format) => {
    return date.formatDate(ts, format || 'YYYY.MM.DD', {
      dayNames: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
      monthNames: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']
    })
  }
  sync(store, router, { moduleName: 'route' })
  Vue.prototype.$time = time
  Vue.prototype.$random = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }
  var colors = {}
  Vue.prototype.$randomColor = function (id, opacity) {
    const r = () => Math.floor(256 * Math.random())
    if (opacity) return colors[id] || (colors[id] = `rgb(${r()}, ${r()}, ${r()}, ${opacity})`)
    else return colors[id] || (colors[id] = `rgb(${r()}, ${r()}, ${r()})`)
  }
  Vue.prototype.$strip = function (obj) {
    let round = (obj) => {
      if (obj['__typename']) delete obj['__typename']
      for (const k in obj) {
        if (obj[k] === Object(obj[k])) round(obj[k])
      }
    }
    round(obj)
    return obj
  }
  Vue.prototype.$nodesDistinct = function (nodes) {
    const result = []
    const map = new Map()
    for (const node of nodes) {
      if (!map.has(node.oid)){
        map.set(node.oid, true)
        result.push(node)
      }
    }
    return result
  }
  // errors
  Vue.config.errorHandler = function(err, vm, info) {
    debug(`### VUE ERROR ### ${err.toString()}\nInfo: ${info}`)
    debug(err.stack)
    Notify.create({message: err.toString(), color: 'red', colorText: 'red'})
  }
  // window.onerror = function(msg, src, linenum, colnum, error) {
  //   debug('### ERROR ###', msg.toString())
  //   Notify.create({message: msg.toString(), color: 'red', colorText: 'red'})
  // }
  Vue.component('kPage', () => import(`components/k_page`))
  Vue.component('kMenuPopup', () => import(`components/k_menu_popup`))
  Vue.component('kDialog', () => import(`components/k_dialog`))
  Vue.component('wsContentEditor', () => import('components/workspace/ws_content_editor'))
  Vue.component('wsBookmarkEditor', () => import('components/workspace/ws_bookmark_editor'))
  Vue.component('wsFragmentEditor', () => import('components/workspace/ws_fragment_editor'))
  Vue.component('node', () => import('components/node'))
  Vue.component('nodeRate', () => import('components/node/node_rate'))
  Vue.component('nodeLoader', () => import('components/node_loader'))
}

export { time }
