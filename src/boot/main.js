const debug = require('debug')('[boot]:main')
debug.enabled = true
import VueVirtualScroller from 'vue-virtual-scroller'
import { LoadingBar, date, Notify } from 'quasar'
import TweenMax from 'gsap/TweenMax'
import VueObserveVisibility from 'vue-observe-visibility'
// import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import { sync } from 'vuex-router-sync'

const time = (sec) => {
  let hrs = ~~(sec / 3600)
  let mins = ~~((sec % 3600) / 60)
  let secs = ~~sec % 60
  let arr = sec.toString().split('.')
  let ms = ''
  if (arr.length > 1) ms = arr[1]

  let result = ''
  if (hrs > 0) result += '' + hrs + ':' + (mins < 10 ? '0' : '')

  result += '' + mins + ':' + (secs < 10 ? '0' : '')
  result += '' + secs
  if (ms !== '') result += ':' + ms.substring(0, 3)
  return result
}

export default async ({ Vue, store, router }) => {
  Vue.use(VueVirtualScroller)
  Vue.use(VueObserveVisibility)
  Vue.prototype.$wait = (msg) => new Promise(resolve => setTimeout(resolve, msg))
  Vue.prototype.$log = function (...msg) {
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
  Vue.config.errorHandler = function(err, vm, info) {
    debug(`### VUE ERROR ### ${err.toString()}\nInfo: ${info}`)
    Notify.create({message: err.toString(), color: 'red', colorText: 'red'})
  }
  window.onerror = function(msg, src, linenum, colnum, error) {
    debug('### ERROR ###', msg.toString())
    Notify.create({message: msg.toString(), color: 'red', colorText: 'red'})
  }
}

export { time }
