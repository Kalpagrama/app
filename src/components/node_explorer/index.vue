<style lang="sass">
body
  position: fixed
  overscroll-behavior: none
</style>
<template lang="pug">
q-layout(view="hHh lpR fFf" container :style=`{height: $q.screen.height+'px'}` @scroll="onScrollLayout").bg-black
  q-page-container
    q-page
      div(
        v-touch-pan.mouse.mightPrevent="onPanBody"
        :style=`{position: 'relative', height: $q.screen.height-extraHeight+'px'}`).row.full-width
        //- back
        q-btn(
          flat round icon="keyboard_arrow_left" color="white"
          :style=`{position: 'absolute', top: '10px', left: '10px', background: 'rgba(0,0,0,0.3)'}`)
        //- tint
        div(
          v-if="extraMode === 'mini'"
          @click="extraHeight = 'natural'"
          :style=`{position: 'absolute', zIndex: 2000}`).row.fit
        .column.fit
          .col.full-width.q-pa-xs
            div(ref="nodeWrapper").row.fit.items-start.content-start
              img(
                ref="nodePreview"
                :src="node.meta.compositions[0].thumbUrl"
                @load="imgLoaded"
                :style=`{objectFit: 'contain', pointerEvents: 'none', borderRadius: '10px', overflow: 'hidden'}`).full-width
              div(:style=`{position: 'relative', bottom: '0px', minHeight: '60px'}`).row.full-width.items-center.content-center.q-py-sm.q-px-md
                span.text-bold.text-white {{ name }}
              div().row.full-width.q-px-md
                div(:style=`{width: '40px', height: '40px', borderRadius: '50%'}`).row.bg-grey-4
                .col.full-height
                  .row.fit.items-center.content-center.q-pl-sm
                    span.text-white Ivan Motovilov
                    small.text-white.full-width @ivanmoto
              div().row.full-width.q-px-md.q-mt-md
                span(v-for="(s,si) in name.split(' ')" :key="si" :style=`{borderRadius: '10px'}`).text-white.q-py-xs.q-px-sm.q-mr-xs.q-mb-xs.bg-grey-9 {{'#'+s}}
      //- fixed
      div(
        :style=`{
          position: 'fixed', zIndex: 1000, bottom: '0px', right: '0px',
          borderRadius: '10px 10px 0 0', overflow: 'hidden',
          height: extraHeight+'px'}`
        ).row.full-width.bg-grey-10
        component(:is="`extra-${tab}`" :node="node" :nodeFull="nodeFull" @click.native="heightKey = 'preview'")
</template>

<script>
import extraStats from './extra_stats'
import extraExplore from './extra_explore'
import extraConnections from './extra_connections'
import extraPeople from './extra_people'

export default {
  name: 'nodeExplorer',
  components: {extraStats, extraExplore, extraConnections, extraPeople},
  props: ['node'],
  data () {
    return {
      name: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s\'',
      nodeFull: null,
      previewHeight: 0,
      nodeHeight: 0,
      extraHeight: 0,
      heightKey: 'maxi',
      tab: 'explore',
      tabs: [
        {id: 'stats', name: 'Stats'},
        {id: 'explore', name: 'Explore'},
        {id: 'connections', name: 'Connections'},
        // {id: 'spheres', name: 'Spheres'},
        {id: 'people', name: 'People'}
      ]
    }
  },
  computed: {
    heights () {
      return {
        mini: 60,
        preview: this.previewHeight + 8,
        node: this.nodeHeight + 8,
        maxi: this.$q.screen.height - 60
      }
    }
  },
  watch: {
    heightKey: {
      immediate: true,
      handler (to, from) {
        this.$log('heightKey CHANGED', to)
        this.$tween.to(this, 0.3, {extraHeight: this.$q.screen.height - this.heights[to]})
      }
    }
  },
  methods: {
    onPanBody (e) {
      // this.$log('onPanBody', e)
      let to = this.extraHeight - e.delta.y
      // if (to < this.heights.maxi || to > this.extraHeights.mini) return
      this.extraHeight = to
      if (e.isFinal) {
        // if (to > this.$q.screen.height / 3) {
        //   if (to > this.$q.screen.height / 2) {
        //     this.$tween.to(this, 0.3, {extraHeight: this.$q.screen.height - 60})
        //   }
        //   else {
        //     this.$tween.to(this, 0.3, {extraHeight: this.$q.screen.height * 0.63})
        //   }
        // }
        // else {
        //   this.$tween.to(this, 0.3, {extraHeight: 120})
        // }
      }
    },
    onScrollLayout (e) {
      this.$log('onScrollLayout', e)
    },
    imgLoaded (e) {
      this.$log('imgLoaded', e)
      let ref = this.$refs.nodePreview
      let height = ref.clientHeight
      this.$log('height', height)
      this.previewHeight = height
      let refNodeWrapper = this.$refs.nodeWrapper
      this.nodeHeight = refNodeWrapper.clientHeight
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
