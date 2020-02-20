<template lang="pug">
div(
  :style=`{height: mini ? 'auto' : '100%'}`
  ).row.full-width.items-start.content-start.bg-black
  //- debug
  div(
    v-if="false"
    :style=`{position: 'absolute', top: '2px', left: '2px', zIndex: 10000, borderRadius: '10px'}`).row.q-pa-sm.bg-green
    small.text-white.full-width mini: {{ mini }}
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
    :src="contentUrl" :source="content.contentSource" :ctx="ctx"
    :mini="mini" :active="active" :visible="visible"
    :style=`{maxHeight: $q.screen.height+'px', position: 'absolute', top: '0px', zIndex: 1000, overflow: 'hidden'}`).fit
    template(v-slot:editor=`{player, meta}`)
      player(:ctx="ctx" :content="content" :layers="layers" :player="player" :meta="meta" :active="active" :visible="visible" :mini="mini")
      slot(name="editor" :player="player" :meta="meta")
</template>

<script>
import { debounce, throttle } from 'quasar'
import playerVideo from './player_video'
import playerImage from './player_image'
import player from './player'

export default {
  name: 'composition',
  components: {playerVideo, playerImage, player},
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
    layer () {
      return this.value.layers[this.layerIndex]
    },
    content () {
      return this.value.layers[0].content
      // return this.value.layers.reduce((acc, val) => {
      //   if (!acc && val.figuresAbsolute.length === 0) acc = val.content
      //   return acc
      // }, null)
    },
    contentUrl () {
      if (this.content) {
        if (this.content.contentSource === 'KALPA') {
          if (this.ctx === 'workspace' || this.ctx === 'editor') {
            return this.content.url
          } else {
            return this.layer.url
          }
        }
        else if (this.content.contentSource === 'YOUTUBE') {
          return this.content.url
        }
        else {
          return false
        }
      } else {
        return false
      }
    },
    layers () {
      if (this.value) {
        return this.value.layers
      }
      else {
        return []
      }
      // if (this.value) {
      //   return this.value.layers.filter((l, li) => {
      //     return l.figuresAbsolute.length > 0
      //   })
      // } else {
      //   return []
      // }
    }
  },
  watch: {
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
