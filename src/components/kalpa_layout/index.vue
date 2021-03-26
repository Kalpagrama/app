<template lang="pug">
div(
  :style=`{
    //- position: 'relative',
    position: 'fixed', zIndex: 10, top: '0px', left: '0px', right: '0px', bottom: '0px',
    height: _height+'px',
    //- maxHeight: $store.state.ui.viewportHeight+'px',
  }`
  ).column.full-width
  //- header
  div(
    :style=`{
      position: 'absolute', zIndex: 2000, top: '0px',
    }`
    ).row.full-width
    q-resize-observer(@resize="headerHeight = $event.height")
    //- small.text-white.bg-red {{ scrollTop }}
    slot(name="header" :scrollTop="scrollTop" :scrollHeight="scrollHeight")
  //- body
  //- v-touch-pan.mouse="onPan"
  div(
    ref="body-wrapper"
    :style=`{
      position: 'relative',
      //- paddingBottom: '500px',
    }`
    @scroll="onScroll"
    ).col.full-width.scroll
    div(:style=`{height: headerHeight+'px'}`).row.full-width
    slot(name="body" :scrollTop="scrollTop" :scrollHeight="scrollHeight")
    div(:style=`{height: footerHeight+'px'}`).row.full-width
  //- footer
  div(
    :style=`{
      position: 'absolute', zIndex: 1000, bottom: '0px',
    }`
    ).row.full-width
    q-resize-observer(@resize="footerHeight = $event.height")
    slot(name="footer" :scrollTop="scrollTop" :scrollHeight="scrollHeight")
</template>

<script>
import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock'

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
      this.scrollTop = e.target.scrollTop
      this.scrollWidth = e.target.scrollWidth
      this.scrollHeight = e.target.scrollHeight
      this.bodyHeight = e.target.clientHeight
    },
    onPan (e) {
      this.$log('onPan', e)
      this.$q.notify({position: 'top', message: 'onPan'})
      // this.footerHeight += e.delta.y
    }
  },
  mounted () {
    this.$log('mounted')
    // disable scroll of everything exept scroll
    // TODO maybe global shit...
    this.$nextTick(() => {
      disableBodyScroll(this.$refs['body-wrapper'], {
        allowTouchMove: el => {
          while (el && el !== document.body) {
            if (el.classList.contains('scroll')) return true
            el = el.parentElement;
          }
        },
      })
    })
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    enableBodyScroll(this.$refs['body-wrapper'])
  }
}
</script>
