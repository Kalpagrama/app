<template lang="pug">
div(:style=`{position: 'relative'}`).row.fit
  //- slots
  div(:style=`{position: 'absolute', zIndex: 1000, left: '16px', top: '50%'}`).row
    slot(name="left")
  div(:style=`{position: 'absolute', zIndex: 1000, right: '16px', top: '50%'}`).row
    slot(name="right")
  //- debug
  div(
    v-if="false"
    :style=`{position: 'absolute', top: '50px', left: '16px', zIndex: 10000}`).row.bg-green
    small.full-width.text-white layerIndex: {{layerIndex}}
    small.full-width.text-white layers:
    small(v-for="(l,li) in layers" :key="li").full-width.text-white {{ l.figuresAbsolute }}
  //- content name & menu & action slots
  div(
    :style=`{position: 'absolute', zIndex: 1000, top: 0, height: '60px'}`
    ).row.full-width.items-center.q-pa-md.cursor-pointer
    .col.full-height
      .row.fit.items-center.content-center
        span(
          @click="contentNameClick()"
          :style=`{
            borderRadius: '10px', overflow: 'hidden',
            userSelect: 'none', pointerEvents: 'none',
            background: 'rgba(0,0,0,0.5)'}`
          ).text-white.q-pa-sm {{content.name}}
  //- players
  //- TODO: content.type => player...
  player-video(
    :url="contentUrl" :source="contentSource"
    :start="layerStart" :end="layerEnd" :visible="visible"
    @player="$emit('player', $event)" @ended="layerEnded")
    //- TODO: props is options on one object...
    template(v-slot:layerEditor=`{player, now, progressHeight}`)
      slot(name="layerEditor" :player="player" :now="now" :progressHeight="progressHeight")
</template>

<script>
import { throttle } from 'quasar'
import playerVideo from './player_video'
import playerImage from './player_image'

export default {
  name: 'composition',
  components: {playerVideo, playerImage},
  props: ['ctx', 'composition', 'layerIndexPlay', 'visible'],
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
      if (this.layerFiguresRelative) {
        return this.layerFiguresRelative[0].t
      } else {
        return this.layer.figuresAbsolute[0] ? this.layer.figuresAbsolute[0].t : false
      }
    },
    layerEnd () {
      if (this.layerFiguresRelative) {
        return this.layerFiguresRelative[1].t
      } else {
        return this.layer.figuresAbsolute[1] ? this.layer.figuresAbsolute[1].t : false
      }
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
    contentNameClick () {
      this.$log('contentNameClick')
      // TODO: show content modal...
    },
    play () {
      this.$log('play')
    },
    pause () {
      this.$log('pause')
    },
    playPause () {
      this.$log('playPause')
    },
    layerEnded () {
      this.$log('*** layerEnded')
      this.$log('NOW => ', this.layerIndex)
      // TODO: throttle it ???))
      if (this.layerIndexPlay) {
        this.$q.notify('layerIndexPlay' + this.layerIndexPlay)
        this.layerIndex = this.layerIndexPlay
      } else {
        // move to the next layer, this composition player
        let layerTo = this.layerIndex + 1
        if (this.layers[layerTo]) {
          // this.$q.notify('NEXT layer next =>' + layerTo)
          this.$log('NEXT => ', layerTo)
          this.$set(this, 'layerIndex', layerTo)
          // this.layerIndex = layerTo
        }
        else {
          this.$log('LAST => 0')
          this.$set(this, 'layerIndex', 0)
          // this.layerIndex = 0
        }
      }
    }
  },
  created () {
    this.layerEnded = throttle(this.layerEnded, 300)
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
