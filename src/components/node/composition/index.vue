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
  //- composition menu
  //- TODO move to player_video...
  q-btn(
    v-if="true && ctx !== 'workspace' && visible && active && !mini && value"
    round flat color="white" icon="more_vert"
    :style=`{
      position: 'absolute', zIndex: 2000, top: '10px', right: '10px',
      background: 'rgba(0,0,0,0.5)', transform: 'translate3d(0,0,0)'
    }`)
    q-menu(cover anchor="top right" max-width="300px")
      .column.fit.bg-grey-9
        div(:style=`{minHeight: '50px'}`).row.full-width.items-center.content-center.q-pa-md
          //- span.text-white.text-bold {{ value.layers[0].content.name }}
        .col.full-width.scroll
          //- .row.full-width.items-center.content-center
          q-btn(flat dark no-caps align="left" :to="'/content/'+value.layers[0].contentOid").full-width Go to content
          q-btn(flat dark no-caps align="left").full-width Report
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
    :bgClass="bgClass"
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
    styles: {type: Object, default () { return {} }},
    bgClass: {type: String, default () { return 'bg-black' }}
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
      let options = {
        timeout: 3000,
        header: this.value.layers[0].content.name,
        actions: {
          save: {
            name: 'Save composition',
            payload: {oid: this.value.oid},
            cb: () => {
              this.$log('save composition')
            }
          },
          content: {
            name: 'Go to content',
            payload: {oid: this.value.layers[0].content.oid},
            cb: () => {
              this.$log('go to content')
              this.$router.push('/content/' + this.value.layers[0].content.oid).catch(e => e)
            }
          }
        }
      }
      this.$store.dispatch('ui/action', [options, key => key ? options.actions[key].cb() : false])
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
