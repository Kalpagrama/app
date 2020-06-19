<template lang="pug">
div(
  :style=`{
    position: 'fixed',
    top: '0px',
    height: $q.screen.height+'px',
    maxHeight: heightViewport > 0 ? heightViewport+'px' : '100%',
  }`
  ).row.full-width.items-start.content-start.justify-center
  q-resize-observer(@resize="onResizeQuasar")
  //- keyboard height debug
  div(
    v-if="false"
    :style=`{
      position: 'fixed', top: '0px', right: '0px', zIndex: 99999,
      height: heightViewport+'px',
      width: '100px',
      opacity: 0.5,
    }`
    ).row.items-center.content-center.justify-center.bg-red.bg
    .row.full-width.justify-center
      small.text-white hv: {{heightViewport}}
    .row.full-width.justify-center
      small.text-white hs: {{heightScreen}}
  //- panel left
  div(
    v-if="true"
    :style=`{
      position: 'fixed', top: '8px', left: '8px', zIndex: 10000,
      maxWidth: panelLeftMaxWidth+'px',
      maxHeight: panelLeftMaxHeight+'px',
      borderRadius: $store.state.ui.borderRadius+'px', overflow: 'hidden',
    }`).row.items-start.content-start.justify-center.b-50
    div(:style=`{height: 50+'px'}`).row.full-width.items-center.content-center.justify-end.q-px-sm
      q-btn(round flat dense icon="menu" color="white" @click="panelLeftToggle()")
    .row.full-width
      slot(name="panelLeft")
  //- panel right
  div(
    v-if="true"
    :style=`{
      position: 'fixed', top: '8px', right: '8px', zIndex: 10000,
      maxWidth: panelRightMaxWidth+'px',
      maxHeight: panelRightMaxHeight+'px',
      borderRadius: $store.state.ui.borderRadius+'px', overflow: 'hidden',
    }`).row.items-start.content-start.justify-center.b-50
    div(:style=`{height: 50+'px'}`).row.full-width.items-center.content-center.justify-start.q-px-sm
      q-btn(round flat dense icon="menu" color="white" @click="panelRightToggle()")
    .row.full-width
      slot(name="panelRight")
  //- side left
  div(
    v-if="true && $q.screen.width > pageWidthMin+120"
    :style=`{maxWidth: '500px'}`).col.full-height
    .row.fit.justify-end.q-pa-sm
      slot(name="panelLeft")
  //- middle
  div(
    v-if="true"
    :style=`{
      maxWidth: pageWidth+'px',
    }`
    ).column.fit
    div().row.full-width
      //- q-btn(round flat icon="keyboard_arrow_left" @click="$router.back()")
      slot(name="header" :statePage="statePage")
    div(
      @scroll="onScroll"
      :style=`{
        overflowX: 'hidden',
      }`
      ).col.full-width.scroll
      slot(name="body" :statePage="statePage")
    div().row.full-width
      slot(name="footer" :statePage="statePage")
  //- side right
  div(
    v-if="true && $q.screen.width > pageWidthMin+120"
    :style=`{maxWidth: '500px'}`).col.full-height
    .row.fit.justify-start.q-pa-sm
      slot(name="panelRight")
</template>

<script>
export default {
  name: 'kalpaPage',
  data () {
    return {
      heightScreen: 0,
      heightViewport: 0,
      scrollTop: 0,
      panelLeftOpened: false,
      panelLeftMaxWidth: 50,
      panelLeftMaxHeight: 50,
      panelRightOpened: false,
      panelRightMaxWidth: 50,
      panelRightMaxHeight: 50,
      pageFullscreen: false,
      pageWidth: 800,
      pageWidthMin: 800,
    }
  },
  computed: {
    pageWidthMax () {
      return this.$q.screen.width
    },
    statePage () {
      return {
        scrollTop: this.scrollTop,
        panelLeftOpened: this.panelLeftOpened,
        panelRightOpened: this.panelRightOpened,
        pageFullscreen: this.pageFullscreen,
        set: (key, val) => {
          this[key] = val
        }
      }
    }
  },
  watch: {
    heightViewport: {
      handler (to, from) {
        // this.$log('heightViewport TO', to)
        if (to < this.heightScreen) {
          // alert('heightViewport < heightScreen: ' + to + ' < ' + this.heightScreen)
        }
      }
    },
    pageFullscreen: {
      immediate: true,
      handler (to, from) {
        this.$log('pageFullscreen TO', to)
        this.$tween.to(this, 0.3, {pageWidth: to ? this.pageWidthMax : this.pageWidthMin})
      }
    },
    panelLeftOpened: {
      handler (to, from) {
        this.$log('panelLeftOpened TO', to)
        this.$tween.to(
          this,
          0.3,
          {
            panelLeftMaxWidth: to ? 500 : 50,
            panelLeftMaxHeight: to ? this.$q.screen.height : 50
          }
        )
      }
    },
    panelRightOpened: {
      handler (to, from) {
        this.$log('panelRightOpened TO', to)
        this.$tween.to(
          this,
          0.3,
          {
            panelRightMaxWidth: to ? 500 : 50,
            panelRightMaxHeight: to ? this.$q.screen.height : 50
          }
        )
      }
    },
  },
  methods: {
    panelLeftToggle () {
      this.$log('pageLeftToggle')
      this.panelLeftOpened = !this.panelLeftOpened
    },
    panelRightToggle () {
      this.$log('pageRightToggle')
      this.panelRightOpened = !this.panelRightOpened
    },
    onScroll (e) {
      // this.$log('onScroll', e)
      this.scrollTop = e.target.scrollTop
    },
    onResizeQuasar (e) {
      // this.$log('onResizeQuasar', e)
      if (this.heightScreen === 0) this.heightScreen = e.height
      if (this.heightViewport === 0) this.heightViewport = e.height
    },
    onResize (e) {
      // this.$log('onResize', e)
      this.heightViewport = e.target.height
      this.heightScreen = this.$q.screen.height
      // this.$log('heightViewport', this.heightViewport)
      // this.$log('heightScreen', this.heightScreen)
      // this.$log('heightViewport', this.heightViewport)
    }
  },
  mounted () {
    this.$log('mounted')
    window.visualViewport.addEventListener('resize', this.onResize)
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    window.visualViewport.removeEventListener('resize', this.onResize)
  }
}
</script>
