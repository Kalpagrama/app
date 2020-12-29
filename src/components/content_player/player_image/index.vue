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
  :class=`{
  }`
  :style=`{
    position: 'relative',
    ...styles,
  }`
  ).row.full-width
  image-cropper(
    v-if="contentKalpa.url"
    ref="imageCropper"
    :src="contentKalpa.url"
    :options=`{
      viewMode: 2,
      //- dragMode: 'move',
      dragMode: mode,
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
  div(
    :style=`{
      position: 'absolute', zIndex: 1000, bottom: '8px',
    }`
    ).row.full-width.justify-center
    div(
      :style=`{
        maxWidth: '300px',
        borderRadius: '10px',
      }`
      ).row.full-width.q-pa-sm.bg-black
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
  div(
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
import imageCropper from 'components/image_cropper/index.vue'

export default {
  name: 'contentPlayer_image',
  props: ['contentKalpa', 'styles'],
  components: {
    imageCropper,
  },
  data () {
    return {
      // currentPage: 0,
      figures: [],
      points: [],
      isFullscreen: false,
      imageValid: false,
      player: null,
      cropping: false,
      mode: 'move',
      url: null,
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
    async imageCrop () {
      this.$log('imageCrop')
      // TODO: get data...
      this.player.getCroppedCanvas().toBlob(async (blob) => {
        this.url = URL.createObjectURL(blob)
        this.$log('url', this.url)
        this.cropping = false
      })
    },
    imageCropped (e) {
      // this.$log('imageCropped', e)
    }
  },
  mounted () {
    this.$log('mounted')
    this.$emit('player', this)
    this.isFullscreen = true
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    if (this.url) URL.revokeObjectURL(this.url)
  }
}
</script>
