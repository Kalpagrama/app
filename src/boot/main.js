import VueVirtualScroller from 'vue-virtual-scroller'

export default async ({ Vue }) => {
  Vue.use(VueVirtualScroller)
  Vue.prototype.$wait = (msg) => new Promise(resolve => setTimeout(resolve, msg))
  Vue.prototype.$log = function (...msg) {
    const debug = require('debug')(`[${this.$options.name}] `)
    debug.enabled = true
    debug(...msg)
  }
}
