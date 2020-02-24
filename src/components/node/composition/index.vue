<template lang="pug">
div(
  :style=`{position: 'relative', height: mini ? 'auto' : '100%'}`
  ).row.full-width.items-start.content-start.bg-black
  //- debug
  div(
    v-if="false"
    :style=`{position: 'absolute', top: '2px', left: '2px', zIndex: 10000, borderRadius: '10px'}`).row.q-pa-sm.bg-green
    small.text-white.full-width mini: {{ mini }}
  //- composition menu
  //- next tint
  div(
    v-if="mini" @click="$emit('next')"
    :style=`{position: 'absolute', zIndex: 4000, opacity: 0.5}`).row.fit.cursor-pointer
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
    v-if="visible && value"
    :ctx="ctx" :composition="value"
    :visible="vis" :active="active" :mini="mini"
    :style=`{maxHeight: $q.screen.height+'px', position: 'absolute', top: '0px', zIndex: 1000}`).fit
    template(v-slot:editor=`{player, meta}`)
      slot(name="editor" :player="player" :meta="meta")
</template>

<script>
import { debounce, throttle } from 'quasar'
import playerVideo from './player_video'
import playerImage from './player_image'
// import player from './player'

export default {
  name: 'composition',
  components: {playerVideo, playerImage},
  props: {
    ctx: {type: String},
    value: {type: Object},
    preview: {type: String},
    visible: {type: Boolean, default () { return false }},
    active: {type: Boolean, default () { return false }},
    mini: {type: Boolean, default () { return false }}
  },
  data () {
    return {
      // layerIndex: 0,
      vis: false,
      previewWidth: 0,
      previewHeight: 0,
      previewLoaded: false
    }
  },
  watch: {
    visible: {
      handler (to, from) {
        this.$log('visible CHANGED', to)
        this.vis = to
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
      this.$emit('previewError')
    }
  }
}
</script>
