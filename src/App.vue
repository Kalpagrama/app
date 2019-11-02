<template lang="pug">
div(id="q-app" ref="kapp")
  router-view
</template>

<script>
import {disableBodyScroll} from 'body-scroll-lock'
import { AddressbarColor } from 'quasar'

export default {
  name: 'App',
  created () {
    AddressbarColor.set('#342d58')
  },
  mounted () {
    // this.$log('name', this.$store.state.core.name)
    // disableBodyScroll(this.$refs.kapp, {
    //   allowTouchMove: el => {
    //     while (el && el !== document.body) {
    //       if (el.getAttribute('body-scroll-lock-ignore') !== null) {
    //         // if (el.scrollTop > 0) return true
    //         // else return false
    //         return true
    //       }
    //       el = el.parentNode
    //     }
    //   }
    // })
  },
  watch: {
    '$route': {
      handler (to, from) {
        this.$log('$route CHANGED', to)
        // this.$router.push(to.path)
      }
    }
  }
}
</script>

<style lang="stylus">
.q-menu
  // background: none
  box-shadow: none
.q-drawer
  background: none
</style>
