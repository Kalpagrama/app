<style lang="sass">
.cropper-crop-box
  // display: none
.cropper-modal
  // display: none
.cropper-line
  // background-color: rgb(76,175,79) !important
</style>

<template lang="pug">
div(
  :style=`{
    position: 'relative',
    ...styles,
  }`
  ).row.full-width
  //- img(
    v-if="contentKalpa.url"
    draggable="false"
    :src="contentKalpa.url"
    :style=`{
      //- objectFit: 'contain',
      objectFit: 'cover',
      borderRadius: '10px',
    }`
    ).fit
  //- player-tint(
    :contentKalpa="contentKalpa")
  div(
    v-if="figure"
    :style=`{
      position: 'absolute', zIndex: 1000,
    }`
    ).row.fit.items-start.content-start.b-30.br
    img(
      @click="url = null"
      :src="url"
      :style=`{
        objectFit: 'contain',
        background: 'rgb(35,35,35)',
        borderRadius: '10px',
      }`
      ).fit.bg
  image-cropper(
    v-if="contentKalpa.url"
    ref="imageCropper"
    :src="contentKalpa.url"
    :options=`{
      viewMode: 2,
      dragMode: 'move',
      //- dragMode: mode,
      initialAspectRatio: 10/10,
      minCropBoxHeight: 100,
      minCropBoxWidth: 100,
      autoCrop: false,
      background: false,
      responsive: true,
      checkCrossOrigin: true,
      checkOrientation: true,
      guides: false,
      cropBoxMovable: true,
      cropBoxResizable: true,
    }`
    @cropper="player = $event"
    @crop="imageCropped"
    :style=`{
      //- border: imageValid ? 'none' : '2px solid red',
      borderRadius: '10px', overflow: 'hidden',
    }`)
  //- footer
  div(
    :style=`{
      position: 'absolute', zIndex: 1000, bottom: '8px',
    }`
    ).row.full-width.justify-center
    slot(name="tint-bar" :tintFocused="true")
    div(
      :style=`{
        maxWidth: '300px',
        borderRadius: '20px',
        background: 'rgba(30,30,30,0.5)',
      }`
      ).row.full-width.q-pa-sm
      q-btn(round flat dense color="white" icon="refresh" @click="player.reset()")
      .col
      q-btn(
        v-if="cropping"
        @click="imageCrop()"
        color="green" no-caps) Crop
      .col
      q-btn(
        @click="cropping = !cropping"
        round flat dense
        :color="cropping ? 'white' : 'green'"
        :icon="cropping ? 'clear' : 'add_circle_outline'")
  //- publish
  //- div(
    v-if="url"
    :style=`{
      position: 'absolute', zIndex: 1000, bottom: '50px',
    }`
    ).row.full-width.justify-center
    div(
      :style=`{
        maxWidth: '500px',
      }`
      ).row.full-width
      img(
        draggable="false"
        :src="url"
        :style=`{
          //- maxWidth: '500px',
          borderRadius: '10px',
        }`
        ).full-width.br
      .row.full-width
        q-btn(
          @click="cropping = false"
          color="green" no-caps
          ) Publish
  //- img(
    draggable="false"
    :src="contentKalpa.url"
    :style=`{
      borderRadius: '10px',
      objectFit: 'contain',
      background: 'rgb(35,35,35)',
      ...styles
    }`
    ).full-width
</template>

<script>
import playerTint from './player_tint.vue'
import imageCropper from 'components/image_cropper/index.vue'

export default {
  name: 'contentPlayer_image',
  props: ['contentKalpa', 'styles'],
  components: {
    playerTint,
    imageCropper,
  },
  data () {
    return {
      events: {},
      figures: [],
      points: [],
      isFullscreen: false,
      imageValid: false,
      player: null,
      cropping: false,
      mode: 'move',
      url: null,
      figure: null,
      figureEditing: null
    }
  },
  watch: {
    cropping: {
      handler (to, from) {
        if (to) {
          this.mode = 'crop'
          this.player.crop()
        }
        else {
          this.mode = 'move'
          this.player.clear()
        }
      }
    }
  },
  methods: {
    setState (key, val) {
      this.$log('setState', key, val)
      this[key] = val
    },
    play () {},
    pause () {},
    setCurrentTime (t) {},
    async imageCrop () {
      this.$log('imageCrop')
      // TODO: get data...
      this.player.getCroppedCanvas().toBlob(async (blob) => {
        this.url = URL.createObjectURL(blob)
        this.$log('url', this.url)
        this.cropping = false
        // this.figure = [{t: null, points: []}]
        this.figure = this.figureEditing
      })
    },
    imageCropped (e) {
      // this.$log('imageCropped', e)
      let imageWidth = e.target.width
      let imageHeight = e.target.height
      let x = e.detail.x / imageHeight
      let y = e.detail.y / imageHeight
      let w = e.detail.width / imageWidth
      let h = e.detail.height / imageHeight
      // this.$log({imageWidth, imageHeight, x, y, w, h})
      // this.figureEditing = [
      //   {t: null, points: [{x: x, y: y}]},
      //   {t: null, points: [{x: x + w, y: y}]},
      //   {t: null, points: [{x: x + w, y: y + h}]},
      //   {t: null, points: [{x: x, y: y + h}]}
      // ]
      this.figureEditing = [
        {
          t: null,
          points: [
            {x: x, y: y},
            {x: x + w, y: y},
            {x: x + w, y: y + h},
            {x: x, y: y + h}
          ]
        }
      ]
      this.$log('figure', JSON.stringify(this.figureEditing))
    }
  },
  mounted () {
    this.$log('mounted')
    this.$emit('player', this)
    this.events = {
      on: (event, cb) => {
        // if (this.$refs.videoRef) this.$refs.videoRef.addEventListener(event, cb)
      },
      off: (event, cb) => {
        // if (this.$refs.videoRef) this.$refs.videoRef.removeEventListener(event, cb)
      },
      emit: (event, val) => {
        // if (this.$refs.videoRef) this.$refs.videoRef.dispatchEvent(new CustomEvent(event, {detail: val}))
      }
    }
    this.isFullscreen = true
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    if (this.url) URL.revokeObjectURL(this.url)
  }
}
</script>
