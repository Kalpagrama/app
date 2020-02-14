<template lang="pug">
div(:style=`{position: 'relative'}`).row.full-width.items-start.content-start.bg-black
  //- slots
  div(:style=`{position: 'absolute', zIndex: 1000, left: '16px', top: '50%'}`).row
    slot(name="left")
  div(:style=`{position: 'absolute', zIndex: 1000, right: '16px', top: '50%'}`).row
    slot(name="right")
  //- debug
  div(
    v-if="false"
    :style=`{position: 'absolute', top: '50px', left: '16px', zIndex: 10000}`).row.bg-green
    //- small.full-width.text-white layerIndex: {{layerIndex}}
    //- small.full-width.text-white layers:
    //- small(v-for="(l,li) in layers" :key="li").full-width.text-white {{ l.figuresAbsolute }}
    small.full-width.text-white ctx: {{ ctx }}
  //- content name & menu & action slots
  //- TODO content click goes to content in workspace and adds it to your workspace automatically
  div(
    v-if="opened"
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
          ).text-white.q-pa-sm {{ content.name }}
  //- mini toggle
  div(
    v-if="mini" @click="$emit('mini')"
    :style=`{position: 'absolute', zIndex: 200, opacity: 0.5}`).row.fit.cursor-pointer
  //- preview
  img(
    v-if="thumbUrl" ref="compositionPreview" :src="thumbUrl" crossOrigin="anonymous" draggable="false" @load="previewLoad" @error="previewError"
    :style=`{width: '100%', maxHeight: $q.screen.height/2+'px', objectFit: 'contain'}`)
  //- players
  player-video(
    v-if="composition && content && content.type === 'VIDEO'"
    ref="player"
    :url="contentUrl" :source="contentSource" :ctx="ctx" :fullHeight="fullHeight"
    :start="layerStart" :end="layerEnd" :visible="visible" :mini="mini"
    :style=`thumbUrl ? {maxHeight: $q.screen.height*0.8+'px', position: 'absolute', zIndex: 100} : null`
    @player="$emit('player', $event)" @ended="layerEnded")
    //- :style=`{position: thumbUrl ? 'absolute' : 'relative', zIndex: 100}`
    //- TODO: props is options on one object...
    template(v-slot:layerEditor=`{player, now, progressHeight}`)
      slot(name="layerEditor" :player="player" :now="now" :progressHeight="progressHeight")
</template>

<script>
import { debounce } from 'quasar'
import playerVideo from './player_video'
import playerImage from './player_image'

export default {
  name: 'composition',
  components: {playerVideo, playerImage},
  props: ['ctx', 'composition', 'layerIndexPlay', 'visible', 'active', 'mini', 'thumbUrl', 'extending', 'fullHeight'],
  data () {
    return {
      layerIndex: 0,
      previewWidth: 0,
      previewHeight: 0,
      previewLoaded: false
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
      if (this.ctx === 'workspace') {
        return this.layer.figuresAbsolute[0] ? this.layer.figuresAbsolute[0].t : false
      } else {
        return this.layer.figuresRelative[0] ? this.layer.figuresRelative[0].t : false
      }
    },
    layerEnd () {
      if (this.ctx === 'workspace') {
        return this.layer.figuresAbsolute[1] ? this.layer.figuresAbsolute[1].t : false
      } else {
        return this.layer.figuresRelative[1] ? this.layer.figuresRelative[1].t : false
      }
    },
    layers () {
      if (this.composition) return this.composition.layers
      else return []
    },
    content () {
      if (this.composition) return this.composition.layers[this.layerIndex].content
      else return null
    },
    contentUrl () {
      if (this.content) {
        if (this.ctx === 'workspace') {
          return this.content.url
        } else {
          return this.layer.url
        }
      } else {
        return false
      }
    },
    contentSource () {
      if (this.content) return this.content.contentSource
      else return null
    }
  },
  watch: {
    mini: {
      immediate: true,
      handler (to, from) {
        // this.$log('mini CHANGED', to)
        if (to) this.pause()
        else this.play()
      }
    }
  },
  methods: {
    contentNameClick () {
      this.$log('contentNameClick')
      // TODO: show content modal... or go to the workspace contents
    },
    previewLoad () {
      // this.$log('previewLoad')
      let h = this.$refs.compositionPreview.clientHeight
      let w = this.$refs.compositionPreview.clientWidth
      this.$emit('previewHeight', h)
      this.$emit('previewWidth', w)
      this.previewHeight = h
      this.previewWidth = w
      this.previewLoaded = true
    },
    previewError () {
      this.$log('previewError')
    },
    play () {
      // this.$log('play')
      if (this.$refs.player && this.$refs.player.player && !this.mini) this.$refs.player.player.play()
    },
    pause () {
      // this.$log('pause')
      if (this.$refs.player && this.$refs.player.player) this.$refs.player.player.pause()
    },
    playPause () {
      this.$log('playPause')
    },
    layerEnded () {
      this.$log('*** layerEnded')
      this.$log('NOW => ', this.layerIndex)
      if (this.mini) return
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
    this.layerEnded = debounce(this.layerEnded, 300)
  },
  mounted () {
    // this.$log('mounted')
  },
  beforeDestroy () {
    // this.$log('beforeDestroy')
  }
}
</script>
