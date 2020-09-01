<template lang="pug">
div(
  :style=`{
    position: 'relative',
    height: options.isFit ? '100%' : 'auto',
    }`
  ).row.full-width.items-start.content-start
  //- content explorer btn
  transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
    content-explorer(
      v-if="isActive"
      :composition="composition"
      :options="options")
  //- video spinner
  transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
    div(
      v-if="isActive"
      :style=`{
        position: 'absolute', zIndex: 1000, transform: 'translate3d(0,0,0)',
        bottom: '8px', left: '8px',
      }`)
      q-btn(round flat color="white" :style=`{background: 'rgba(0,0,0,0.15)',}`)
        q-spinner-audio(
          v-if="!muted"
          @click="mutedOn()"
          size="25px" color="white").q-mx-sm
        q-icon(
          v-if="muted"
          @click="mutedOff()"
          size="25px" color="red" name="volume_off").q-mx-sm
  //- preview
  img(
    :src="composition.thumbUrl"
    draggable="false"
    :style=`{
      borderRadius: '10px', overflow: 'hidden',
      userSelect: 'none',
      height: options.isFit ? '100%' : 'auto',
      objectFit: options.isFit ? 'contain' : 'contain'
    }`
    ).full-width
  //- video wrapper
  div(
    v-if="isActive && isVisible"
    :style=`{
      position: 'absolute', zIndex: 200, transform: 'translate3d(0,0,0)',
    }`
    ).row.fit
    video(
      @click="videoClicked"
      @loadedmetadata="videoLoadedmetadata"
      ref="compositionVideoRef"
      :src="composition.url"
      :muted="muted"
      playsinline loop
      :style=`{
        objectFit: 'contain',
        borderRadius: '10px', overflow: 'hidden',
      }`
      ).fit
</template>

<script>
import contentExplorer from './content_explorer.vue'

export default {
  name: 'compositionPlayer_playerVideo',
  components: {contentExplorer},
  props: {
    isVisible: {type: Boolean},
    isActive: {type: Boolean},
    composition: {type: Object, required: true},
    options: {
      type: Object,
      default () {
        return {
          isFit: false,
        }
      }
    }
  },
  data () {
    return {
      muted: true,
      contentKalpa: null,
    }
  },
  watch: {
    isActive: {
      handler (to, from) {
        // this.$log('isActive TO', to, composition.oid)
        this.mutedCheck()
        if (!this.$refs.compositionVideoRef) return
        if (to) {
          this.$refs.compositionVideoRef.play()
        }
        else {
          this.$refs.compositionVideoRef.pause()
        }
      }
    },
  },
  methods: {
    mutedOff () {
      this.$log('mutedOff')
      this.muted = false
      localStorage.setItem('k_sound_on', 'true')
    },
    mutedOn () {
      this.$log('mutedOn')
      this.muted = true
      localStorage.removeItem('k_sound_on')
    },
    mutedCheck () {
      // this.$log('mutedCheck')
      if (this.$q.platform.is.desktop) {
        let soundOn = localStorage.getItem('k_sound_on')
        // this.$log('mutedCheck soundOn', soundOn)
        if (soundOn === 'true') {
          this.muted = false
        }
        else {
          this.muted = true
        }
      }
    },
    videoClicked (e) {
      this.$log('videoClicked', e)
      if (this.muted) {
        this.muted = false
        e.target.play()
      }
      else {
        if (e.target.paused) e.target.play()
        else e.target.pause()
      }
    },
    videoLoadedmetadata (e) {
      // this.$log('videoLoadedmetadata', e)
      if (this.isActive) {
        e.target.play()
      }
    },
  },
  mounted () {
    this.mutedCheck()
    // this.$log('mounted')
  }
}
</script>
