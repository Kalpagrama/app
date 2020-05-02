<template lang="pug">
div(
  :style=`{position: 'relative', height: mini ? 'auto' : '100%', borderRadius: '10px', overflow: 'hidden'}`
  ).row.full-width.items-start.content-start
  //- debug
  div(
    v-if="false"
    :style=`{
      position: 'absolute', zIndex: 1000, top: '0px', color: 'white',
      transform: 'translate3d(0,0,0)',
    }`
    ).row.full-width
    .row.bg-red
      small active: {{active}}
  //- mini tint
  div(
    v-if="mini" @click="$emit('next')"
    :style=`{position: 'absolute', zIndex: 4000, opacity: 0.5}`).row.fit.cursor-pointer
  //- preview
  img(
    v-if="preview" ref="compositionPreview" :src="preview" draggable="false"
    @load="previewLoad" @error="previewError" @click="previewClick"
    :style=`{
      userSelect: 'none',
      width: '100%', height: mini ? 'auto' : '100%', opacity: playerGood ? 0 : 1,
      maxHeight: 500+'px', objectFit: 'contain', ...styles}`)
  //- players
  player-video(
    v-if="visible && value"
    :ctx="ctx" :composition="value" :preview="preview"
    :visible="visible" :active="active" :mini="mini"
    :bgClass="bgClass"
    @good="playerGood = true"
    :style=`{maxHeight: $q.screen.height+'px', position: 'absolute', top: '0px', zIndex: 100, ...styles}`).fit
    template(v-slot:editor=`{player, meta}`)
      slot(name="editor" :player="player" :meta="meta")
</template>

<script>
import { debounce, throttle } from 'quasar'
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
    active: {type: Boolean, default () { return false }},
    mini: {type: Boolean, default () { return false }},
    styles: {type: Object, default () { return {} }}
  },
  data () {
    return {
      previewLocal: undefined,
      previewWidth: 0,
      previewHeight: 0,
      previewLoaded: false,
      playerGood: false
    }
  },
  computed: {
  },
  watch: {
    visible: {
      handler (to, from) {
        this.$log('visible CHANGED', to)
        if (to) {
        }
        else {
          this.playerGood = false
        }
      }
    }
  },
  methods: {
    previewLoad () {
      // this.$log('previewLoad')
      let previewRef = this.$refs.compositionPreview
      if (!previewRef) return
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
    },
    previewClick () {
      this.$log('previewClick')
      // if (!this.value) {
      //   this.$emit('compositionGet')
      // }
    }
  },
  mounted () {
    // this.$log('mounted')
  },
  beforeDestroy () {
    // this.$log('beforeDestroy')
  }
}
</script>
