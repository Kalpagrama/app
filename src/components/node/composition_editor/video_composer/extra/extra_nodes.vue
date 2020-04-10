<template lang="pug">
div(:style=`{}`).column.fit
  //- actions
  //- add
  q-btn(
    v-if="meta.layerIndexPlay < 0"
    round push color="green" icon="add" @click="layerAdd()"
    :style=`{position: 'absolute', zIndex: 1000, right: '10px', top: '-50px', borderRadius: '50%'}`)
  //- confirm
  q-btn(
    v-if="meta.layerIndexPlay >= 0"
    round push color="green" icon="check" @click="layerConfirm()"
    :style=`{position: 'absolute', zIndex: 1000, right: '10px', top: '-50px', borderRadius: '50%'}`)
  //- header
  //- transition(appear enter-active-class="animated slideInUp" leave-active-class="animated fadeOut")
  div(
    v-if="height > 100"
    :style=`{height: '70px'}`).row.full-width
    layer-editor(
      :layers="layers"
      :layerIndex="meta.layerIndexPlay"
      :layer="layers[meta.layerIndexPlay >= 0 ? meta.layerIndexPlay : meta.layerIndex]"
      :content="content" :player="player" :meta="meta")
  //- body
  div(
    ref="extraNodesScroll"
    :style=`{position: 'relative', overflow: scrollOverflow}`
    @scroll="onScroll"
    ).col.full-width.scroll.q-pa-sm
    div(:style=`{marginTop: '0px', marginBottom: '1000px'}`).row.full-width.items-start.content-start
      div(
        v-for="(l,li) in layers" :key="li" :ref="`layer-${li}`"
        v-if="l.figuresAbsolute.length > 0" @click="layerClick(l, li)"
        :class=`{
          'bg-grey-7': li === meta.layerIndexPlay,
          'bg-grey-8': li !== meta.layerIndexPlay,
        }`
        :style=`{minHeight: '35px', borderRadius: '10px', overflow: 'hidden'}`
        ).row.full-width.items-center.content-center.q-px-sm.q-mb-sm
        //- transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
        //-   div(
        //-     v-if="li === meta.layerIndexPlay"
        //-     :style=`{height: '70px'}`).row.full-width
        //-     //- layer-editor(:layer="l" :layerIndex="li" :content="content" :layers="layers" :player="player" :meta="meta")
        div(:style=`{height: '35px'}`).row.full-width.items-center.content-center
          .col
          small.text-white {{$time(l.figuresAbsolute[0].t)}}-
          small.text-white {{$time(l.figuresAbsolute[1].t)}}
</template>

<script>
import layerEditor from '../layer_editor'

export default {
  name: 'extraNodes',
  components: {layerEditor},
  props: ['composition', 'player', 'meta', 'height'],
  data () {
    return {
      scrollTweening: false,
      scrollOverflow: 'auto',
      scrollTimeout: null,
    }
  },
  computed: {
    layers () {
      return this.composition.layers
    },
    layer () {
      return this.layers[this.meta.layerIndex]
    },
    content () {
      return this.layer.content
    }
  },
  watch: {
    'meta.layerIndexPlay': {
      handler (to, from) {
        this.$log('meta.layerIndexPlay CHANGED', to)
        if (to < 0) return
        // let refs = this.$refs[`layer-${to}`]
        let ref = this.$refs[`layer-${to}`][0]
        this.$log('ref', ref)
        let offsetTop = ref.offsetTop
        this.$log('offsetTop', offsetTop)
        this.$tween.to(this.$refs.extraNodesScroll, 0.2, {scrollTop: offsetTop - 8})
      }
    }
  },
  methods: {
    layerClick (l, li) {
      this.$log('layerClick', l, li)
      this.$emit('meta', ['mode', 'layer'])
      this.$emit('meta', ['layerIndexPlay', li])
      this.scrollOverflow = 'hidden'
    },
    layerConfirm () {
      this.$log('layerConfirm')
      this.$emit('meta', ['layerIndexPlay', -1])
      this.scrollOverflow = 'auto'
      this.$tween.to(this.$refs.extraNodesScroll, 0.2, {scrollTop: 0})
    },
    layerAdd (startInput, endInput, layerInput) {
      this.$log('layerAdd start')
      this.$log('layerAdd inputs: ', startInput, endInput, layerInput)
      let start = startInput || this.meta.now - 3 > 0 ? this.meta.now - 3 : 0
      let end = endInput || start + 10 < this.meta.duration ? start + 10 : this.meta.duration
      this.$log('layerAdd start/end: ', start, end)
      // get index
      let index
      if (this.layers.length === 1 && this.layers[0].figuresAbsolute.length === 0) index = 0
      else index = this.composition.layers.length
      this.$log('layerIndex index:', index)
      // get layer
      let l = layerInput || {
        content: this.content,
        figuresAbsolute: [
          {t: start, points: []},
          {t: end, points: []}
        ],
        figuresRelative: [],
        spheres: []
      }
      // set layer
      this.$set(this.composition.layers, index, l)
      // set meta
      this.$emit('meta', ['mode', 'layer'])
      this.$emit('meta', ['layerIndexPlay', index])
      this.$emit('meta', ['layerIndex', -1])
      this.$emit('meta', ['layerIndex', index])
      // scroll to layer?
      this.$log('layerAdd done')
    },
    onScroll () {
      // this.$log('onScroll')
      // if (this.scrollTweening) return
      if (this.scrollTimeout === null) this.scrollTimeout = setTimeout(this.onScrollend, 500)
    },
    onScrollend () {
      this.$log('onScrollend')
      clearTimeout(this.scrollTimeout)
      this.scrollTimeout = null
      let ref = this.$refs.extraNodesScroll
      // scrollTop to 100
      // if (ref.scrollTop < 100) {
      //   if (this.scrollTweening) return
      //   this.$q.notify('SCROLL TO 100')
      //   this.scrollOverflow = 'hidden'
      //   this.scrollTweening = true
      //   this.$tween.to(ref, 0.1, {
      //     scrollTop: 100,
      //     onComplete: () => {
      //       this.$wait(600).then(() => {
      //         this.scrollOverflow = 'auto'
      //         this.scrollTweening = false
      //       })
      //     }
      //   })
      // }
    }
  }
}
</script>
