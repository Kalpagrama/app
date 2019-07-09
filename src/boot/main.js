const debug = require('debug')('[boot]:main')
// debug.enabled = true
import VueVirtualScroller from 'vue-virtual-scroller'
import { LoadingBar, date } from 'quasar'
import TweenMax from 'gsap/TweenMax'
import VueObserveVisibility from 'vue-observe-visibility'

export default async ({ Vue }) => {
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
}
