<style lang="stylus">
html, body {
  background: #eee;
}
</style>
<template lang="pug">
div(
  id="q-app" ref="kapp").row.full-width.justify-center.bg-grey-3
  router-view
  div(v-if="!$store.state.core.online" :style=`{position: 'absolute', zIndex: 100, top: '0px', height: '10px'}`).row.full-width.justify-end.items-center.q-px-md.bg-red-4
    small(style=`font-size: 8px`).text-bold.text-primary {{'offline'}}
</template>

<script>
// import { AddressbarColor } from 'quasar'
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
    // this.$log('created')
    // window.alert('Created')
    this.$q.addressbarColor.set('#eee')
    // this.disableBodyScroll()
  }
}
</script>
