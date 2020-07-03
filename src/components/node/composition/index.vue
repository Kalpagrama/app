<template lang="pug">
div(:style=`{position: 'relative'}`).row.full-width.items-start.content-start.bg-black
  composition-explorer(v-if="composition" v-bind="$props" :composition="composition" :content="content" :player="$refs.videoRef")
  composition-menu(v-if="composition" v-bind="$props" :composition="composition" :content="content" :player="$refs.videoRef")
  //- preview
  img(
    @click="$emit('previewClick')"
    draggable="false"
    :src="preview"
    :style=`{
      objectFit: 'contain',
      opacity: loaded ? 0 : 1,
      maxHeight: $q.screen.height-120+'px',
    }`
    ).fit.cursor-pointer
  //- debug
  //- kalpa-debug(
  //-   v-if="composition && !mini && false"
  //-   :options=`{url: composition.url, videoLoaded,currentTime,duration}`
  //-   :style=`{position: 'absolute', top: 0, zIndex: 1000,transform: 'translate3d(0,0,0)'}`)
  composition-controls(
    v-if="!mini && $refs.videoRef"
    :currentTime="currentTime"
    :duration="duration"
    :player="$refs.videoRef"
    :playing="playing")
  video(
    v-if="composition && composition.url.length > 0 && active"
    ref="videoRef"
    type="video/mp4"
    :src="composition.url"
    :autoplay="true"
    :loop="loop"
    :muted="muted"
    :controls="controls"
    :playsinline="playsinline"
    preload="auto"
    @play="onPlay"
    @pause="onPause"
    @click="onClick"
    @ended="onEnded"
    @loadeddata="onLoadeddata"
    @timeupdate="onTimeupdate"
    :style=`{
      position: 'absolute', zIndex: 100,
      objectFit: 'contain',
    }`
    ).fit
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import compositionControls from './composition_controls'
import compositionExplorer from './composition_explorer'
import compositionMenu from './composition_menu'

export default {
  name: 'composition',
  components: {compositionControls, compositionExplorer, compositionMenu},
  props: {
    preview: {type: String},
    value: {type: Object, required: true},
    loop: {type: Boolean},
    visible: {type: Boolean},
    active: {type: Boolean},
    mini: {type: Boolean}
  },
  data () {
    return {
      content: null,
      composition: null,
      // player
      loaded: false,
      currentTime: 0,
      duration: 0,
      playing: false,
      playsinline: true,
      muted: false,
    }
  },
  watch: {
    visible: {
      immediate: true,
      async handler (to, from) {
        // this.$log('visible TO', to)
        if (to && this.value.oid) {
          this.$log('visible TRUE => load composition: ', this.value.oid)
          this.composition = await this.$rxdb.get(RxCollectionEnum.OBJ, this.value.oid)
          this.content = await this.$rxdb.get(RxCollectionEnum.OBJ, this.composition.layers[0].contentOid)
        }
        else {
          this.loaded = false
        }
      }
    },
    active: {
      handler (to, from) {
        this.$log('active TO', to)
        if (!this.$refs.videoRef) return
        if (to) this.$refs.videoRef.play()
        else this.$refs.videoRef.pause()
      }
    },
    '$store.state.ui.active': {
      handler (to, from) {
        this.$log('$store.state.ui.active TO',)
        if (to === false && this.$refs.videoRef) this.$refs.videoRef.pause()
      }
    }
  },
  methods: {
    onClick () {
      this.$log('onClick')
      if (this.muted) {
        this.muted = false
      }
      else {
        if (this.playing) {
          if (this.$refs.videoRef) this.$refs.videoRef.pause()
        }
        else {
          if (this.$refs.videoRef) this.$refs.videoRef.play()
        }
      }
    },
    onPlay () {
      this.$log('onPlay')
      this.playing = true
    },
    onPause () {
      this.$log('onPause')
      this.playing = false
    },
    onEnded (e) {
      this.$log('onEnded', e)
      this.$emit('ended')
    },
    onTimeupdate (e) {
      // this.$log('onTimeupdate', e)
      this.currentTime = e.target.currentTime
    },
    onLoadeddata (e) {
      this.$log('onLoadeddata', e)
      this.duration = e.target.duration
      this.loaded = true
      this.$emit('started')
    }
  }
}
</script>
