<template lang="pug">
div(id="q-app").row.window-height.full-width.items-center.justify-center.bg-black
  id="q-app" ref="kapp"
  :style=`{height: $q.screen.height+'px', position: 'fixed'}`).full-width.bg-primary
    router-view
</template>

<script>
  import { AddressbarColor } from 'quasar'
import { disableBodyScroll } from 'body-scroll-lock'

export default {
  methods: {
    disableBodyScroll () {
      disableBodyScroll(this.$refs.kapp, {
        allowTouchMove: el => {
          while (el && el !== document.body) {
            let classList = el.classList
            // this.$log('classList', classList)
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
    this.disableBodyScroll()
    }
}
</script>
