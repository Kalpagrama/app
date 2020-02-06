<template lang="pug">
div(:style=`{position: 'relative'}`).row.fit
  //- slots
  div(:style=`{position: 'absolute', zIndex: 1000, left: '16px', top: '50%'}`).row
    slot(name="left")
  div(:style=`{position: 'absolute', zIndex: 1000, right: '16px', top: '50%'}`).row
    slot(name="right")
  //- content name & menu & action slots
  div(
    :style=`{position: 'absolute', zIndex: 1000, top: 0, height: '60px'}`
    ).row.full-width.items-center.q-pa-md.cursor-pointer
    .col.full-height
      .row.fit.items-center.content-center
        span(
          @click="contentClick"
          :style=`{
            borderRadius: '10px', overflow: 'hidden',
            userSelect: 'none', pointerEvents: 'none',
            background: 'rgba(0,0,0,0.5)'}`
          ).text-white.q-pa-sm {{content.name}}
  //- players
  //- TODO: content.type => player...
  player-video(
    :url="contentUrl" :source="contentSource"
    :start="layerStart" :end="layerEnd"
    @player="$emit('player', $event)" @ended="layerEnded")
    //- TODO: props is options on one object...
    template(v-slot:layerEditor=`{player, now, progressHeight}`)
      slot(name="layerEditor" :player="player" :now="now" :progressHeight="progressHeight")
</template>

<script>
import playerVideo from './player_video'
import playerImage from './player_image'

export default {
  name: 'composition',
  components: {playerVideo, playerImage},
  props: ['ctx', 'composition'],
  data () {
    return {
      layerIndex: 0
    }
  },
  computed: {
    layer () {
      return this.layers[this.layerIndex]
    },
    layerFiguresRelative () {
      return this.layer.figuresRelative
    },
    layerStart () {
      if (this.layerFiguresRelative) return this.layerFiguresRelative[0].t
      else return false
    },
    layerEnd () {
      if (this.layerFiguresRelative) return this.layerFiguresRelative[1].t
      else return false
    },
    layers () {
      return this.composition.layers
    },
    content () {
      return this.composition.layers[this.layerIndex].content
    },
    contentUrl () {
      return this.content.url
    },
    contentSource () {
      return this.content.contentSource
    }
  },
  methods: {
    contentClick () {
      this.$log('contentClick')
    },
    layerEnded () {
      this.$log('layerEnded')
      // move to the next layer, this composition player
      if (this.layerIndex === this.layers.length - 1) this.layerIndex = 0
      else this.layerIndex += 1
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
