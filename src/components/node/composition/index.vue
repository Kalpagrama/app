<template lang="pug">
div(:style=`{position: 'relative'}`).row.full-width.items-start.content-start
  q-btn(
    v-if="!mini"
    round flat color="white" icon="more_vert"
    :style=`{
      position: 'absolute', top: '8px', right: '8px', zIndex: 2000,
      transform: 'translate3d(0,0,0)',
      background: 'rgba(0,0,0,0.1)'
    }`)
  img(
    :src="preview"
    :style=`{
      objectFit: 'contain',
      opacity: videoLoaded ? 0 : 1,
      maxHeight: $q.screen.height-120+'px',
    }`
    ).full-width
  kalpa-debug(
    v-if="composition && !mini && false"
    :options=`{url: composition.url, videoLoaded,}`
    :style=`{position: 'absolute', top: 0, zIndex: 1000,transform: 'translate3d(0,0,0)'}`)
  video(
    v-if="composition && composition.url.length > 0 && active"
    ref="videoRef"
    type="video/mp4"
    :src="composition.url"
    :autoplay="true"
    :loop="true"
    :muted="muted"
    :controls="controls"
    :playsinline="playsinline"
    preload="auto"
    @loadeddata="videoLoadeddata"
    @play="playing = true"
    @pause="playing = false"
    @click="videoClick"
    :style=`{
      position: 'absolute', zIndex: 100,
      objectFit: 'contain',
    }`
    ).fit.br
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'composition',
  props: {
    preview: {
      type: String
    },
    value: {
      type: Object,
      required: true
    },
    visible: {type: Boolean},
    active: {type: Boolean},
    mini: {type: Boolean}
  },
  data () {
    return {
      composition: null,
      videoLoaded: false,
      playing: false,
      playsinline: true,
      muted: true
    }
  },
  watch: {
    visible: {
      immediate: true,
      async handler (to, from) {
        this.$log('visible TO', to)
        if (to) {
          this.$log('visible TRUE => load composition')
          this.composition = await this.$rxdb.get(RxCollectionEnum.OBJ, this.value.oid)
        }
        else {
          this.videoLoaded = false
        }
      }
    },
    active: {
      immediate: true,
      handler (to, from) {
        this.$log('active TO', to)
        if (to) {
          // if (this.$refs.videoRef) this.$refs.videoRef.play()
        }
        else {
          // if (this.$refs.videoRef) this.$refs.videoRef.pause()
          this.videoLoaded = false
        }
      }
    }
  },
  methods: {
    videoClick () {
      this.$log('videoClick')
      if (this.muted) {
        this.muted = false
      }
      else {
        if (this.playing) {
          this.$refs.videoRef.pause()
        }
        else {
          this.$refs.videoRef.play()
        }
      }
      // this.muted = false
    },
    videoLoadeddata () {
      this.$log('videoLoadeddata')
      this.videoLoaded = true
    }
  }
}
</script>
