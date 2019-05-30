const debug = require('debug')('[boot]:main')
// debug.enabled = true
import VueVirtualScroller from 'vue-virtual-scroller'
import { LoadingBar } from 'quasar'

export default async ({ Vue }) => {
  Vue.use(VueVirtualScroller)
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
}
