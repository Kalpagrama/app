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
  //- preview your crop...
  div(
    v-if="false && figure"
    :style=`{
      position: 'absolute', zIndex: 1000,
    }`
    ).row.fit.items-start.content-start.b-30.br
    img(
      @click="url = null"
      :src="urlCropped"
      :style=`{
        objectFit: 'contain',
        background: 'rgb(35,35,35)',
        borderRadius: '10px',
      }`
      ).fit.bg
  image-cropper(
    v-if="url"
    ref="imageCropper"
    :src="url"
    :options=`{
      viewMode: 0,
      dragMode: 'move',
      //- dragMode: mode,
      // initialAspectRatio: 10/10,
      minCropBoxHeight: 100,
      minCropBoxWidth: 100,
      autoCrop: false,
      background: false,
      responsive: true,
      checkCrossOrigin: true,
      checkOrientation: true,
      guides: true,
      cropBoxMovable: true,
      cropBoxResizable: true,
    }`
    @cropper="cropper = $event"
    @crop="onCropChanged"
    :style=`{
      //- border: imageValid ? 'none' : '2px solid red',
      borderRadius: '10px', overflow: 'hidden',
    }`)
  //- footer
  div(
    :style=`{
      position: 'absolute', zIndex: 1000, bottom: '8px',
    }`
    ).row.full-width.justify-center.q-px-sm
    slot(name="tint-bar" :tintFocused="true")
    div(
      :style=`{
        maxWidth: '300px',
        borderRadius: '20px',
        background: 'rgba(40,40,40,0.9)',
      }`
      ).row.full-width.q-pa-sm
      q-btn(round flat dense color="white" icon="refresh" @click="cancelCrop")
      .col
      q-btn(
        v-if="!figure"
        no-caps round flat
        icon="crop" color="grey"
        @click="startCrop")
      q-btn(
        v-if="figure"
        no-caps round flat
        icon="crop" color="green"
        @click="cancelCrop")
      .col
      q-btn(
        v-if="!selectedDraft"
        @click="createNodeDraft()"
        round flat dense
        :color="cropping ? 'white' : 'green'"
        :icon="cropping ? 'clear' : 'add_circle_outline'")
      q-btn(
        v-if="selectedDraft"
        @click="selectedDraft = null"
        round flat dense
        color="white"
        icon="clear")
</template>

<script>
import playerTint from './player_tint.vue'
import imageCropper from 'src/components/image_cropper/index.vue'
import {assert} from 'src/system/common/utils'
import { ContentApi } from 'src/api/content'
import { RxCollectionEnum } from 'src/system/rxdb'

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
      cropper: null,
      cropping: false,
      mode: 'move',
      urlCropped: null,
      figure: null,
      nodePlaying: null,
      selectedDraft: null
    }
  },
  watch: {
    selectedDraft: {
      handler (to, from) {
        if (to && to.items[0].layers[0].figuresAbsolute.length) {
          this.startCrop()
          let [point1, point2, point3, point4] = this.selectedDraft.items[0].layers[0].figuresAbsolute[0].points
          this.$log('selectedDraft::startCrop', point1, point2, point3, point4)
          this.$log('getContainerData', this.cropper.getImageData())
          let {width, height} = this.cropper.getImageData()
          this.$log('left', point1.x * width)
          this.$log('top', point1.y * height)
          this.cropper.setCropBoxData({
            left: point1.x * width,
            top: point1.y * height,
            width: (point2.x - point1.x) * width,
            height: (point4.y - point1.y) * height,
          })
        }
      }
    }
    // cropping: {
    //   handler (to, from) {
    //     if (to) {
    //       this.mode = 'crop'
    //       this.cropper.crop()
    //     }
    //     else {
    //       this.mode = 'move'
    //       this.cropper.clear()
    //     }
    //   }
    // }
  },
  computed: {
    url () { return ContentApi.urlSelect(this.contentKalpa) }
  },
  methods: {
    startCrop () {
      this.cropper.crop();
    },
    cancelCrop() {
      this.cropper.reset()
      this.cropper.clear()
      this.figure = null
    },
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
      this.cropper.getCroppedCanvas().toBlob(async (blob) => {
        this.urlCropped = URL.createObjectURL(blob)
        this.$log('urlCropped', this.urlCropped)
        this.cropping = false
      })
    },
    onCropChanged (e) {
      this.$log('onCropChanged', e)
      let imageWidth = e.target.width
      let imageHeight = e.target.height
      let x = e.detail.x / imageWidth
      let y = e.detail.y / imageHeight
      let w = e.detail.width / imageWidth
      let h = e.detail.height / imageHeight
      // this.$log({imageWidth, imageHeight, x, y, w, h})
      this.figure = [
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
      if (this.selectedDraft) this.selectedDraft.items[0].layers[0].figuresAbsolute = this.figure
      this.$log('figure', JSON.stringify(this.figure))
    },
    async createNodeDraft () {
      // делаем черновик из текущего выделения
      this.$log('createNodeDraft')
      let nodeInput = {
        name: '',
        thumbUrl: this.contentKalpa.thumbUrl,
        layout: 'HORIZONTAL',
        items: [{
          layers: [{
            contentOid: this.contentKalpa.oid,
            figuresAbsolute: this.figure ? this.figure : []
          }]
        }],
        vertices: [],
        spheres: [],
        category: 'FUN',
        temporary: true,
      }
      let nodeSaved = await this.$rxdb.set(RxCollectionEnum.WS_NODE, nodeInput)
      this.selectedDraft = nodeSaved
    },
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
    if (this.urlCropped) URL.revokeObjectURL(this.urlCropped)
  }
}
</script>
