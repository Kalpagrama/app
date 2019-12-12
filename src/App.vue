<style lang="stylus">
html, body {
  background: #eee;
}
</style>
<template lang="pug">
div(
  id="q-app" ref="kapp").bg-grey-3
    router-view
</template>

<script>
import { AddressbarColor } from 'quasar'
import { disableBodyScroll } from 'body-scroll-lock'
// :style=`{height: $q.screen.height+'px', position: 'fixed'}`).full-width.bg-primary

export default {
  methods: {
    disableBodyScroll () {
      disableBodyScroll(this.$refs.kapp, {
        allowTouchMove: el => {
          while (el && el !== document.body) {
            let classList = el.classList
            // this.$logD('classList', classList)
            // if (classList.contains('scroll')) return true
            el = el.parentNode
          }
        }
      })
    }
  },
  created () {
    // this.$q.notify('App created')
    AddressbarColor.set('#342d58')
    // this.disableBodyScroll()
  }
}
</script>
