const debug = require('debug')('[boot]:main')
// debug.enabled = true
import VueVirtualScroller from 'vue-virtual-scroller'
import { LoadingBar } from 'quasar'
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
}
