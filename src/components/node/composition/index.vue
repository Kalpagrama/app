<template lang="pug">
div(:style=`{position: 'relative'}`).row.full-width.items-start.content-start.bg-black
  composition-explorer(
    v-if="composition"
    v-bind="$props" :composition="composition" :content="content" :player="$refs.videoRef")
  //- composition-menu(v-if="composition && active && !mini" v-bind="$props" :composition="composition" :content="content" :player="$refs.videoRef")
  //- preview
  img(
    @click="$emit('previewClick')"
    @error="previewOnError"
    draggable="false"
    :src="preview"
    :style=`{
      objectFit: 'contain',
      opacity: active ? loaded ? 0 : 1 : 1,
      maxHeight: $q.screen.height-300+'px'
    }`
    ).fit.cursor-pointer
  //- debug
  //- kalpa-debug(
  //-   v-if="composition && !mini && false"
  //-   :options=`{url: composition.url, videoLoaded,currentTime,duration}`
  //-   :style=`{position: 'absolute', top: 0, zIndex: 1000,transform: 'translate3d(0,0,0)'}`)
  composition-controls(
    v-if="active && !mini && $refs.videoRef"
    :player="$refs.videoRef"
    :playing="playing"
    :currentTime="currentTime"
    :duration="duration")
  //- controls
  q-btn(
    v-if="active && !mini && loadedFinal"
    @click="volumeToggle()"
    flat dense
    :color="muted ? 'red' : 'white'"
    :icon="muted ? 'volume_off' : 'volume_up'"
    :style=`{
      position: 'absolute', zIndex: 2100,
      left: '8px', bottom: '16px',
      background: 'rgba(0,0,0,0.1)',
    }`)
    small.text-white.text-bold.q-ml-sm {{$time(duration-currentTime)}}
  //- pause arrow
  q-btn(
    v-if="active && !mini && !playing && loadedFinal"
    @click="onClick()"
    round flat color="white"
    :style=`{
      position: 'absolute', zIndex: 1000,
      top: 'calc(50% - 50px)', left: 'calc(50% - 50px)',
      width: '100px', height:'100px', borderRadius:'50%',
    }`)
    q-icon(name="play_arrow" size="100px" color="white")
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
      loadedFinal: false,
      currentTime: 0,
      duration: 0,
      playing: false,
      // settings
      playsinline: true,
      muted: true,
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
          this.loadedFinal = false
          this.currentTime = 0
          this.duration = 0
          this.playing = false
        }
      }
    },
    active: {
      handler (to, from) {
        this.$log('active TO', to)
        if (!this.$refs.videoRef) return
        this.muted = localStorage.getItem('k_muted') === 'true' ? true : false
        if (to) {
          this.$refs.videoRef.play()
        }
        else {
          this.$refs.videoRef.pause()
          this.loaded = false
          this.loadedFinal = false
          this.currentTime = 0
          this.duration = 0
          this.playing = false
        }
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
    previewOnError () {
      this.$log('previewOnError')
    },
    volumeToggle () {
      this.$log('volumeToggle', this.muted)
      let muted = !this.muted
      this.muted = muted
      localStorage.setItem('k_muted', muted)
    },
    onClick () {
      this.$log('onClick')
      // muted on IOS
      if (this.$q.platform.mobile) {
        this.muted = false
        localStorage.setItem('k_muted', false)
      }
      // play / pause action
      if (!this.$refs.videoRef) return
      if (this.playing) this.$refs.videoRef.pause()
      else this.$refs.videoRef.play()
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
    async onLoadeddata (e) {
      this.$log('onLoadeddata', e)
      this.duration = e.target.duration
      this.loaded = true
      this.muted = localStorage.getItem('k_muted') === 'true' ? true : false
      this.$emit('started')
      await this.$wait(500)
      this.loadedFinal = true
    }
  }
}
</script>
