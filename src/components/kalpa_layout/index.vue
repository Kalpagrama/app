<template lang="pug">
q-layout(view="hHh LpR fFf" @scroll="onScroll")
  q-header()
    q-resize-observer(@resize="headerHeight = $event.height")
    slot(name="header" :scrollTop="scrollTop")
  q-footer()
    q-resize-observer(@resize="footerHeight = $event.height")
    slot(name="footer")
  q-page-containter
    div(overflow-hidden)
      q-page(
        :style=`{
          paddingTop: headerHeight+'px',
          paddingBottom: footerHeight+'px',
        }`)
        slot(name="body")
</template>

<script>
// import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock'

export default {
  name: 'kalpaLayout',
  props: {
    height: {
      type: Number
    },
  },
  data () {
    return {
      showDialog: false,
      scrollTop: 0,
      scrollHeight: 0,
      scrollWidth: 0,
      bodyHeight: 0,
      headerHeight: 0,
      footerHeight: 0,
    }
  },
  computed: {
    _height () {
      return this.height || this.$q.screen.height
    }
  },
  methods: {
    onScroll (e) {
      // this.$log('onScroll', e)
      this.scrollTop = e.position
      // this.scrollTop = e.target.scrollTop
      // this.scrollWidth = e.target.scrollWidth
      // this.scrollHeight = e.target.scrollHeight
      // this.bodyHeight = e.target.clientHeight
    },
    onPan (e) {
      this.$log('onPan', e)
      this.$q.notify({position: 'top', message: 'onPan'})
      // this.footerHeight += e.delta.y
    }
  },
  mounted () {
    // this.$log('mounted')
    // disable scroll of everything exept scroll
    // TODO maybe global shit...
    // this.$nextTick(() => {
    //   disableBodyScroll(this.$refs['body-wrapper'], {
    //     allowTouchMove: el => {
    //       while (el && el !== document.body) {
    //         if (el.classList.contains('scroll')) return true
    //         el = el.parentElement;
    //       }
    //     },
    //   })
    // })
  },
  beforeDestroy () {
    // this.$log('beforeDestroy')
    // enableBodyScroll(this.$refs['body-wrapper'])
  }
}
</script>
