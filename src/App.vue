<template lang="pug">
  div(id="q-app" ref="app")
    router-view
</template>

<script>
import { disableBodyScroll } from 'body-scroll-lock'
export default {
    name: 'App',
    mounted () {
      // this.$log('mounted', this.$route)
      // disableBodyScroll(this.$refs.app, {
      //   allowTouchMove: el => {
      //     while (el && el !== document.body) {
      //       if (el.getAttribute('body-scroll-lock-ignore') !== null) {
      //         return true
      //       }
      //       el = el.parentNode
      //     }
      //   }
      // })
      window.HELP_IMPROVE_VIDEOJS = false
    }
}
</script>
