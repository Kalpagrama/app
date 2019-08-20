<template lang="pug">
div(:style=`{position: 'relative', height: height+'px', paddingTop: '25px', overflow: 'hidden'}`
  ).row.full-width.justify-center.items-start.content-start.bg-grey-4
  //- go back
  div(:style=`{position: 'absolute', top: '0px', height: '50px'}`).row.full-width.items-center
    q-btn(round flat icon="keyboard_arrow_left" color="grey-9" @click="goBack()")
  //- wrapper
  div(ref="kwrapper" :style=`{position: 'relative', height: getHeight+'px', width: getWidth+'px'}`).row.items-center.content-center.bg
    //- name
    div(:style=`{height: getWidth+'px', borderRadius: '50%'}`).row.full-width.items-center.content-center.bg-white
      div(style=`height: 50px`).row.full-width.items-center.justify-center
        span.text-bold {{getName}}//{{isScrolling}}
  //- slider top
  div(v-if="true" ref="kslideswrapper" :style=`{position: 'absolute', zIndex: 1000, bottom: getBottom+'px'}`).row.full-width.items-center.scroll
    q-scroll-observer(horizontal @scroll="$event => onScroll($event, 0)")
    //- slides wrapper
    div(:style=`{paddingLeft: getLeft+'px'}`
      ).row.full-width.items-end.no-wrap.q-pb-md
      //- slide wrapper
      div(v-for="(n, ni) in 50" :key="ni"
        :style=`{height: '200px', minWidth: getWidth+'px'}`).q-px-md
        //- slide
        div(:style=`{position: 'relative', borderTopLeftRadius: '100%'+getRadius+'px', borderTopRightRadius: '100%'+getRadius+'px',
          borderBottomLeftRadius: '100%'+getRadius+'px', borderBottomRightRadius: '100%'+getRadius+'px', overflow: 'hidden'}`
          ).row.fit.bg-grey-3.shadow-5
          //- slide name
          span(style=`position: absolute; bottom: 10px; left: 10px`) hello {{ni}}
          //- slide fragment
          //- node-fragment(v-if="node" :node="node" :nodeFull="nodeFull" :index="0" :mini="true")
</template>

<script>
export default {
  name: 'nodeExplorer_Slider',
  props: ['width', 'height', 'node'],
  data () {
    return {
      nodes: [],
      name: '',
      lefts: [0, 0],
      isScrolling: false,
      isTweening: false,
      fragmentCurrentIndex: 0
    }
  },
  computed: {
    getHeight () {
      return this.height - 50
    },
    getWidth () {
      let w = this.width
      if (w >= 400) return 400
      else return w - 30
    },
    getName () {
      if (this.node) return this.node.name
      else return null
    },
    getLeft () {
      return (this.width / 2) - (this.getWidth / 2)
    },
    getTop () {
      return (this.height / 2) + 50
    },
    getBottom () {
      return (this.height / 2) + 50
    },
    getRadius () {
      return 8
    },
    getFragmentMaxHeight () {
      return (this.height - 50 - 100) / 2
    },
    getWrapper () {
      let w = this.$refs.wrapper
      if (w) return w[0]
      else return null
    }
  },
  watch: {
    isScrolling: {
      handler (to, from) {
        if (to === false) {
          this.$log('scroll END')
          this.isTweening = true
          this.$tween.to(
            this.$refs.kslideswrapper,
            0.5,
            {
              scrollLeft: this.getWidth * (this.fragmentCurrentIndex),
              onComplete: (e) => {
                this.isTweening = false
                this.$log('tween DONE')
              }
            })
        }
      }
    }
  },
  methods: {
    async scrolled (ms) {
      await this.$wait(ms)
      this.isScrolling = false
    },
    onScroll (e, index) {
      this.$log('onScroll', e, index)
      if (this.isTweening) return
      let i = Math.round(e.position / this.getWidth)
      this.$log('i', i)
      this.fragmentCurrentIndex = i
      if (!this.isScrolling) this.scrolled(500)
      this.isScrolling = true
    },
    fragmentClick (f) {
      this.$log('fragmentClick', f)
      // if this fragment is current watch it
      // else make this fragment current / and then tween to it..
      // in a special function?
    },
    goBack () {
      this.$log('goBack')
      this.$emit('close')
      // explore chains
      // explore sphere
      // explore content
      // explore fragment/node
      // commit to chain...
    }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
