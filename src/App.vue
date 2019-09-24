<template lang="pug">
div(id="q-app" ref="kapp")
  router-view
</template>

<script>
import {disableBodyScroll} from 'body-scroll-lock'

export default {
  mounted () {
    disableBodyScroll(this.$refs.kapp, {
      allowTouchMove: el => {
        while (el && el !== document.body) {
          if (el.getAttribute('body-scroll-lock-ignore') !== null) {
            // if (el.scrollTop > 0) return true
            // else return false
            return true
          }
          el = el.parentNode
        }
      }
    })
  }
}
</script>

<style lang="stylus">
.q-menu
  background: none
  box-shadow: none
.q-drawer
  background: none
</style>
