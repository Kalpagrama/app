<template lang="pug">
div(
  :style=`{height: mini ? 'auto' : '100%', borderRadius: '10px', overflow: 'hidden'}`
  ).row.full-width.items-center.content-center.bg-black
  //- height: mini ? 'auto' : '100%',
  //- maxWidth: maxWidth+'px', maxHeight: maxHeight+'px'
  //- slots
  //- div(:style=`{position: 'absolute', zIndex: 1000, left: '16px', top: '50%'}`).row
  //-   slot(name="left")
  //- div(:style=`{position: 'absolute', zIndex: 1000, right: '16px', top: '50%'}`).row
  //-   slot(name="right")
  //- debug
  div(
    v-if="false"
    :style=`{position: 'absolute', top: '2px', left: '2px', zIndex: 10000, borderRadius: '10px'}`).row.q-pa-sm.bg-green
    //- small.text-white.full-width ctx: {{ ctx }}
    small.text-white.full-width mini: {{ mini }}
    //- small.text-white.full-width layerIndex: {{ layerIndex }}
    //- small.text-white.full-width layerIndexPlay: {{ layerIndexPlay }}
  //- composition menu
  //- content name & menu & action slots
  //- TODO content click goes to content in workspace and adds it to your workspace automatically
  //- div(
  //-   v-if="ctx === 'workspace'"
  //-   :style=`{position: 'absolute', zIndex: 1000, top: 0, height: '60px'}`
  //-   ).row.full-width.items-center.q-pa-md.cursor-pointer
  //-   .col.full-height
  //-     .row.fit.items-center.content-center
  //-       span(
  //-         @click="contentNameClick()"
  //-         :style=`{
  //-           borderRadius: '10px', overflow: 'hidden',
  //-           userSelect: 'none', pointerEvents: 'none',
  //-           background: 'rgba(0,0,0,0.5)'}`
  //-         ).text-white.q-pa-sm {{ content.name }}
  //- next tint
  div(
    v-if="mini" @click="$emit('next')"
    :style=`{position: 'absolute', zIndex: 200, opacity: 0.5}`).row.fit.cursor-pointer
  //- preview
  img(
    v-if="preview" ref="compositionPreview" :src="preview" crossOrigin="anonymous" draggable="false"
    @click="previewClick" @load="previewLoad" @error="previewError"
    :style=`{
      userSelect: 'none',
      width: '100%', height: mini ? 'auto' : '100%',
      maxHeight: $q.screen.height+'px', objectFit: 'contain'}`)
  //- players
  //- TODO different players
  player-video(
    v-if="visible && content && content.type === 'VIDEO'"
    ref="player"
    :url="contentUrl" :source="content.contentSource" :ctx="ctx" :fullHeight="fullHeight"
    :start="layerStart" :end="layerEnd" :mini="mini" :active="active" :visible="visible"
    :style=`preview ? {maxHeight: $q.screen.height+'px', position: 'absolute', zIndex: 100} : null`
    @player="$emit('player', $event)" @ended="layerEnded")
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
  props: {
    ctx: {type: String},
    value: {type: Object},
    preview: {type: String},
    visible: {type: Boolean},
    active: {type: Boolean},
    mini: {type: Boolean, default () { return false }}
  },
  data () {
    return {
      layerIndex: 0,
      previewWidth: 0,
      previewHeight: 0,
      previewLoaded: false
    }
  },
  computed: {
    layers () {
      if (this.value) return this.value.layers
      else return []
    },
    layer () {
      return this.layers[this.layerIndex]
    },
    layerStart () {
      if (this.mode === 'watch') return false
      else {
        if (this.ctx === 'workspace') return this.layer.figuresAbsolute[0] ? this.layer.figuresAbsolute[0].t : false
        else return this.layer.figuresRelative[0] ? this.layer.figuresRelative[0].t : false
      }
    },
    layerEnd () {
      if (this.mode === 'watch') return false
      else {
        if (this.ctx === 'workspace') return this.layer.figuresAbsolute[1] ? this.layer.figuresAbsolute[1].t : false
        else return this.layer.figuresRelative[1] ? this.layer.figuresRelative[1].t : false
      }
    },
    content () {
      if (this.layer) return this.layer.content
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
    }
  },
  watch: {
    layerIndexPlay: {
      immediate: true,
      handler (to, from) {
        // this.$log('layerIndexPlay')
        if (to >= 0) {
          this.layerIndex = to
        }
      }
    },
    mini: {
      immediate: true,
      handler (to, from) {
        // this.$log('mini CHANGED')
        if (to) this.pause()
        else this.play()
      }
    },
    active: {
      immediate: true,
      handler (to, from) {
        // this.$log('active CHANGED')
        if (to) {
          if (!this.mini) this.play()
        }
        else this.pause()
      }
    }
  },
  methods: {
    contentNameClick () {
      this.$log('contentNameClick')
      // TODO: show content modal... or go to the workspace contents
    },
    previewClick () {
      this.$log('previewClick')
    },
    previewLoad () {
      // this.$log('previewLoad')
      let previewRef = this.$refs.compositionPreview
      this.previewHeight = previewRef.clientHeight
      this.previewWidth = previewRef.clientWidth
      this.$emit('height', this.previewHeight)
      this.$emit('width', this.previewWidth)
      this.previewLoaded = true
      // const interval = setInterval(() => {
      //   if (previewRef.naturalWidth > 0 && previewRef.naturalHeight > 0) {
      //     clearInterval(interval)
      //     this.previewLoaded = true
      //   }
      // }, 20)
    },
    previewError () {
      this.$log('previewError')
      this.$emit('error', 'previewError')
    },
    play () {
      // this.$log('play')
      if (this.$refs.player && this.$refs.player.player && !this.mini) this.$refs.player.player.play()
    },
    pause () {
      // this.$log('pause')
      if (this.$refs.player && this.$refs.player.player) this.$refs.player.player.pause()
    },
    layerEnded () {
      // this.$log('*** layerEnded')
      // this.$log('NOW => ', this.layerIndex)
      if (this.mini) return
      if (this.layerIndexPlay >= 0) {
        // this.$log('LAYER PLAY')
        this.$q.notify('layerIndexPlay' + this.layerIndexPlay)
        this.layerIndex = this.layerIndexPlay
      } else {
        // this.$log('LAYER DEFAULT')
        // move to the next layer, this composition player
        let layerTo = this.layerIndex + 1
        if (this.layers[layerTo]) {
          // this.$q.notify('NEXT layer next =>' + layerTo)
          // this.$log('NEXT => ', layerTo)
          this.$set(this, 'layerIndex', layerTo)
          // this.layerIndex = layerTo
        }
        else {
          // this.$log('LAST => 0')
          // TODO depend on mode, play first one or play next composition
          this.$emit('ended')
          // this.$set(this, 'layerIndex', 0)
        }
      }
    }
  },
  created () {
    // this.layerEnded = debounce(this.layerEnded, 300)
  },
  mounted () {
    // this.$log('mounted')
  },
  beforeDestroy () {
    // this.$log('beforeDestroy')
  }
}
</script>
