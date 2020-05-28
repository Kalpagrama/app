<template lang="pug">
div(
  :style=`{position: 'relative', height: mini ? 'auto' : '100%', borderRadius: '10px', overflow: 'hidden'}`
  ).row.full-width.items-start.content-start
  //- debug
  div(
    v-if="false"
    :style=`{
      position: 'absolute', zIndex: 1000, top: '0px', color: 'white',
      transform: 'translate3d(0,0,0)'
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
      width: '100%', height: mini ? 'auto' : '100%', opacity: 1,
      margin: '0.5px',
      maxHeight: 500+'px', objectFit: 'contain', ...styles}`)
  //- players
  player-video(
    v-if="visible && composition"
    :ctx="ctx" :composition="composition"
    :visible="visible" :active="active" :mini="mini"
    :itemsCount="itemsCount"
    @good="playerGood = true"
    @ended="$emit('ended', $event)"
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
    position: {type: String},
    value: {type: Object},
    preview: {type: String},
    visible: {type: Boolean},
    active: {type: Boolean, default () { return false }},
    mini: {type: Boolean, default () { return false }},
    styles: {type: Object, default () { return {} }},
    itemsCount: {type: Number}
  },
  data () {
    return {
      composition: null,
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
    value: {
      immediate: true,
      async handler (to, from) {
        // this.$log('value CHANGED', to)
        if (to) {
          if (this.ctx === 'workspace') {
            this.composition = to
          }
          else {
            this.composition = await this.$store.dispatch('objects/get', {oid: to.oid})
          }
        }
      }
    },
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
    },
    previewError () {
      this.$log('previewError')
      this.$emit('error', 'previewError')
      this.$emit('previewError')
    },
    previewClick () {
      this.$log('previewClick')
    }
  },
  async mounted () {
    // this.$log('mounted')
  },
  beforeDestroy () {
    // this.$log('beforeDestroy')
  }
}
</script>
