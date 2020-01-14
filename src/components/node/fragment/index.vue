<template lang="pug">
div(:style=`{position: 'relative', borderRadius: '10px', overflow: 'hidden'}`).row.full-width.items-start.content-start
  img(
    ref="previewRef"
    :src="previewSrc"
    @load="previewLoad" @error="previewError"
    :style=`{width: '100%', maxHeight: 500+'px', objectFit: 'contain', userSelect: 'none', pointerEvents: 'none'}`)
  div(
    v-if="previewLoaded && fragment"
    :style=`{
      position: 'absolute', zIndex: 100,
      top: fullscreen ? '-200px' : '0px',
      minHeight: fullscreen ? 'calc(100% + 400px)' : '100%'}`).row.fit
    q-btn(
      v-if="!mini"
      flat round color="white" :icon="fullscreen ? 'fullscreen_exit' : 'fullscreen'" @click="fullscreenLocal = !fullscreenLocal"
      :style=`{
        position: 'absolute', zIndex: 200,
        left: '16px', top: fullscreen ? '300px' : '100px',
        background: 'rgba(0,0,0,0.3)'}`)
    fragment-video(
      v-if="fragment.content.type === 'VIDEO'"
      ref="fragmentVideo"
      :index="index" :ctx="ctx" :fragment="fragment" :active="active" :visible="visible" :mini="mini" :fullscreen="fullscreen"
      :width="previewWidth" :height="previewHeight"
      @mini="$emit('mini')" @player="$emit('player', $event)")
      //- fragment-image(v-if="fragment && fragment.content.type === 'IMAGE")
      //- fragment-book(v-if="fragment && fragment.content.type === 'BOOK")
</template>

<script>
import fragmentVideo from './fragment_video'

export default {
  name: 'nodeFragment',
  components: {fragmentVideo},
  props: ['index', 'ctx', 'fragment', 'active', 'visible', 'mini', 'stageFirst', 'thumbUrl'],
  data () {
    return {
      stage: 0,
      previewLoaded: false,
      previewHeight: 0,
      previewWidth: 0,
      fullscreenLocal: true
    }
  },
  computed: {
    fullscreen () {
      if (this.fragment) {
        if (this.fragment.content.contentSource === 'YOUTUBE') {
          if (this.fullscreenLocal) return true
          else return false
        } else {
          return false
        }
      } else {
        return false
      }
    },
    previewSrc () {
      if (this.ctx === 'inEditor') {
        return this.fragment.content.thumbUrl
      } else {
        return this.thumbUrl
      }
    },
    now () {
      if (this.$refs.fragmentVideo) {
        return this.$refs.fragmentVideo.now || 0
      } else {
        return 0
      }
    }
  },
  watch: {
    fragment: {
      immediate: true,
      handler (to, from) {
        // this.$log('fragment CHANGED', to)
      }
    }
  },
  methods: {
    play () {
      this.$log('play')
      this.$refs.fragmentVideo.playPause()
    },
    pause () {
      this.$log('pause')
      this.$refs.fragmentVideo.playPause()
    },
    previewLoad () {
      // this.$log('previewLoad')
      let h = this.$refs.previewRef.clientHeight
      let w = this.$refs.previewRef.clientWidth
      this.$emit('previewHeight', h)
      this.$emit('previewWidth', w)
      this.previewHeight = h
      this.previewWidth = w
      this.previewLoaded = true
    },
    previewError (e) {
      // this.$log('previewError', e)
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
