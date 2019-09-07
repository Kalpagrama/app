<template lang="pug">
  div(id="q-app" ref="kapp")
    router-view
</template>

<script>
import { disableBodyScroll } from 'body-scroll-lock'
export default {
    name: 'App',
    mounted () {
      // this.$log('mounted')
      // disableBodyScroll(this.$refs.kapp, {
      //   allowTouchMove: el => {
      //     while (el && el !== document.body) {
      //       if (el.getAttribute('body-scroll-lock-ignore') !== null) {
      //         // this.$q.notify('el')
      //         // log('el', el)
      //         return true
      //       }
      //       el = el.parentNode
      //     }
      //   }
      // })
      // window.HELP_IMPROVE_VIDEOJS = false
    }
}
</script>
