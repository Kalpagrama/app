<template lang="pug">
div(
  :style=`{position: 'relative', height: mini ? 'auto' : '100%'}`
  ).row.full-width.items-start.content-start.bg-black
  //- composition menu
  q-btn(
    v-if="ctx !== 'workspace' && visible && active && !mini && value"
    round flat color="white" icon="more_vert" @click="menuToggle()"
    :style=`{position: 'absolute', zIndex: 2000, top: '10px', right: '10px', background: 'rgba(0,0,0,0.2)'}`)
  //- next tint
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
      maxHeight: $q.screen.height+'px', objectFit: 'contain', ...styles}`)
  //- players
  player-video(
    v-if="visible && value"
    :ctx="ctx" :composition="value"
    :visible="visible" :active="active" :mini="mini"
    :style=`{maxHeight: $q.screen.height+'px', position: 'absolute', top: '0px', zIndex: 1000, ...styles}`).fit
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
      previewLoaded: false
    }
  },
  computed: {
    actions () {
      return {
        save: {
          name: 'Save composition',
          payload: {oid: this.value.oid}
        },
        content: {
          name: 'Go to content',
          payload: {oid: this.value.layers[0].content.oid}
        }
      }
    }
  },
  watch: {
    value: {
      immediate: true,
      async handler (to, from) {
        // this.$log('value CHANGED', to)
        if (to) {
        }
        else {
          if (this.ctx === 'rubick') {
            this.$emit('compositionGet')
          }
        }
      }
    }
  },
  methods: {
    async menuToggle () {
      this.$log('menuToggle')
      const cb = {
        save: () => {
          this.$log('save composition')
        },
        content: () => {
          this.$log('go to content')
          this.$router.push('/content/' + this.value.layers[0].content.oid).catch(e => e)
        }
      }
      this.$store.dispatch('ui/action', [{actions: this.actions, timeout: 3000}, key => key ? cb[key]() : false])
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
