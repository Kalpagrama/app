<style lang="sass">
.layer-item
  &:hover
    background: #888 !important
</style>

<template lang="pug">
div(:style=`{}`).column.fit
  //- actions
  //- add
  q-btn(
    v-if="true"
    round push color="green" icon="add" size="lg" @click="layerAdd()"
    :style=`{position: 'absolute', zIndex: 1000, right: '30px', top: '-90px', borderRadius: '50%'}`)
  //- header
  //- transition(appear enter-active-class="animated slideInUp" leave-active-class="animated fadeOut")
  div(
    v-if="height > 100"
    :style=`{height: '70px'}`).row.full-width
    layer-editor(
      v-if="meta.layer"
      :layers="meta.layers"
      :layerIndex="meta.layerIndexPlay"
      :layer="meta.layer"
      :content="meta.content" :player="player" :meta="meta" @meta="$emit('meta', $event)")
  //- body
  div(
    ref="extraNodesScroll"
    :style=`{position: 'relative', overflow: scrollOverflow}`
    @scroll="onScroll"
    ).col.full-width.scroll.q-pa-sm
    div(:style=`{marginTop: '0px', marginBottom: '1000px'}`).row.full-width.items-start.content-start
      div(
        v-for="(l,li) in meta.layers" :key="li" :ref="`layer-${li}`"
        v-if="l.figuresAbsolute.length > 0" @click="layerClick(l, li)"
        ).row.full-width.q-mb-sm
        div(:style=`{height: '35px', width: '35px'}`).row
        .col
          div(
            :class=`{
              'bg-grey-6': li === meta.layerIndexPlay,
              'bg-grey-8': li !== meta.layerIndexPlay,
            }`
            :style=`{
              borderRadius: '10px', overflow: 'hidden'
            }`
            ).row.fit.cursor-pointer.layer-item
            div(
              :style=`{height: '35px', borderRadius: '10px', oveflow: 'hidden'}`
              ).row.full-width.items-center.content-center.q-pr-sm
              .col
              small.text-white {{$time(l.figuresAbsolute[0].t)}}-
              small.text-white {{$time(l.figuresAbsolute[1].t)}}
        div(:style=`{height: '35px', width: '35px'}`).row.items-center.content-center.justify-center
          q-btn(round flat dense color="grey-5" icon="drag_indicator")
  //- layers workspace modal
  div(
    v-if="showLayersFromWorkspace"
    :style=`{
      position: 'absolute', zIndex: 400, right: '0px', top: '0px',
      maxWidth: '66%', maxHeight: 'calc(100% - 120px)',
      borderRadius: '10px', overflow: 'hidden',
    }`).column.fit.bg-grey-8
    //- header
    div(:style=`{height: '60px'}`).row.full-width.items-center
      .col
        .row.fit.items-center.content-center.q-px-md
          span.text-white Layers from workspace
      q-btn(round flat dense color="white" icon="more_vert").q-mr-md
    //- body
    .col.full-width.scroll
      .row.full-width.items-start.content-start.q-pa-sm
        div(
          v-for="(l,li) in composition.layersWorkspace" :key="li" @click="layerWorkspaceClick(l,li)"
          :style=`{height: '35px', borderRadius: '10px'}`
          ).row.full-width.items-center.bg-grey-7.cursor-pointer.q-px-md.q-mb-sm
          span.text-white {{l.figuresAbsolute[0].t}}-{{l.figuresAbsolute[1].t}}
  //- footer
  div(
    :style=`{height: '60px'}`
    ).row.full-width.items-center.q-px-sm
    .col
    q-btn(
      v-if="composition.layersWorkspace" @click="showLayersFromWorkspace = !showLayersFromWorkspace"
      flat color="green" no-caps) From workspace
</template>

<script>
import layerEditor from '../layer_editor'

export default {
  name: 'extraLayers',
  components: {layerEditor},
  props: ['composition', 'player', 'meta', 'height'],
  data () {
    return {
      scrollTweening: false,
      scrollOverflow: 'auto',
      scrollTimeout: null,
      showLayersFromWorkspace: false
    }
  },
  computed: {
  },
  watch: {
    'meta.layerIndexPlay': {
      handler (to, from) {
        this.$log('meta.layerIndexPlay CHANGED', to)
        // if (to < 0) return
        // let refs = this.$refs[`layer-${to}`]
        // let ref = refs ? refs[0] : null
        // if (!ref) return
        // this.$log('ref', ref)
        // let offsetTop = ref.offsetTop
        // this.$log('offsetTop', offsetTop)
        // this.$tween.to(this.$refs.extraNodesScroll, 0.2, {scrollTop: offsetTop - 8})
      }
    }
  },
  methods: {
    layerWorkspaceClick (l, li) {
      this.$log('layerWorkspaceClick', l, li)
      this.layerAdd(null, null, l)
      this.showLayersFromWorkspace = false
    },
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
    async layerAdd (startInput, endInput, layerInput) {
      this.$log('layerAdd start')
      this.$log('layerAdd inputs: ', startInput, endInput, layerInput)
      let start = startInput || this.meta.now - 3 > 0 ? this.meta.now - 3 : 0
      let end = endInput || start + 10 < this.meta.duration ? start + 10 : this.meta.duration
      this.$log('layerAdd start/end: ', start, end)
      // get index
      let index = this.meta.layers.length
      this.$log('layerIndex index:', index)
      // get layer
      let l = layerInput || {
        contentOid: this.meta.content.oid,
        content: await this.$store.dispatch('objects/get', {oid: this.meta.content.oid}),
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
      // let ref = this.$refs.extraNodesScroll
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
