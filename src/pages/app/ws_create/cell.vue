<style lang="sass">
.cropper-crop-box
  display: none !important
.cropper-modal
  opacity: 0 !important
.cropper-container
  width: 100% !important
  height: 100% !important
</style>

<template lang="pug">
div(
  :style=`{
    position: 'relative',
  }`
  ).row.fit.items-center.content-center.justify-center
  //- file input
  input(
    ref="inputFile" type="file"
    @input="fileChanged"
    :accept="'image/*'"
    :style=`{display: 'none'}`)
  //- actions
  q-btn(
    v-if="editing"
    @click="$emit('delete')"
    round flat dense color="white" icon="delete_outline"
    :style=`{
      position: 'absolute', zIndex: 2000, right: '8px', top: '8px',
      //- background: 'rgba(0,0,0,0.2)',
    }`
    )
  //- resize BTN right-bottom...
  div(
    v-if="editing && !cellIsLast"
    v-touch-pan.horizontal.mouse="onPan"
    :style=`{
      position: 'absolute', zIndex: 2010, right: '-10px',
      bottom: 'calc(50% - 25px)',
      width: '20px', height: '50px',
      borderRadius: '10px',
      cursor: 'grabbing',
    }`).row.items-center.content-center.bg-green
    q-icon(name="drag_indicator" color="white" size="20px")
  //- resize LINE
  div(
    v-if="editing && !cellIsLast"
    :style=`{
      position: 'absolute', zIndex: 2000, right: '-1px', top: 0,
      width: '2px',
      pointerEvents: 'none',
    }`
    ).row.full-height.bg-green
  //- image ADD
  q-btn(
    v-if="!fileUrl"
    @click="$refs.inputFile.click()"
    color="white" icon="bookmark_outline" flat
    ).fit
  //- image PREVIEW
  div(
    v-if="fileUrl"
    :style=`{
      position: 'absolute', zIndex: 100,
      overflow: 'hidden',
    }`
    ).row.fit.items-start.content-start
    img(
      v-if="fileUrl"
      draggable="false"
      :src="fileUrl"
      :style=`{
        objectFit: 'cover',
      }`
      ).fit
    //- image-cropper(
      v-if="fileUrl"
      :src="fileUrl"
      @crop="onCrop"
      ).fit.bg-black
  //- image DELETE
  q-btn(
    v-if="fileUrl && editing"
    @click="fileUrl = null"
    round flat dense color="white" icon="delete_outline"
    :style=`{
      position: 'absolute', zIndex: 110, right: '8px', bottom: '8px',
    }`)
  //- image CONTEXT
  q-btn(
    v-if="fileUrl && !editing"
    round flat dense color="white" icon="select_all"
    :style=`{
      position: 'absolute', zIndex: 110, left: '8px', top: '8px',
    }`)
  //- cell NAME
  //- span(
    :style=`{
      position: 'absolute', zIndex: 110, bottom: '8px', left: '8px',
    }`
    ).text-white.text-bold sic mundus creatus est
  //- tint
  //- div(
    v-if="fileUrl"
    :style=`{
      position: 'absolute', bottom: '-2px', zIndex: 100, transform: 'translate3d(0,0,0)', height: '60px',
      background: 'linear-gradient(0deg, rgba(15,15,15,0.9) 30%, rgba(0,0,0,0) 100%)',
      //- borderRadius: '0 0 10px 10px',
      overflow: 'hidden', pointerEvents: 'none',
    }`).row.full-width
</template>

<script>
export default {
  name: 'cell',
  props: ['editing', 'row', 'rowi', 'cell', 'celli', 'cellIsFirst', 'cellIsLast', 'rowsHeight', 'rowsWidth', 'kWidth', 'kHeight'],
  components: {
    imageCropper: () => import('components/image_cropper/index.vue')
  },
  data () {
    return {
      fileUrl: null,
      fileX: 0,
      fileY: 0,
      pinchOptions: {
        'transition-duration': 0,
      }
    }
  },
  methods: {
    onCrop (e) {
      this.$log('onCrop', e.detail)
    },
    onPan (e) {
      // this.$log('onPan', e.delta.x)
      let wPX = (this.cell.w / 100) * this.rowsWidth
      let dPX = e.delta.x
      let w = wPX += dPX
      let x = (w / this.rowsWidth) * 100
      let d = this.cell.w - x
      this.$emit('d', d)
      this.cell.w = x
    },
    onPanImage (e) {
      // this.$log('onPanImage', e)
      let x = e.delta.x * this.kWidth
      let y = e.delta.y * this.kHeight
      this.fileX += x
      this.fileY += y
    },
    fileChanged (e) {
      this.$log('fileChanged', e)
      let file = e.target.files[0]
      this.fileUrl = URL.createObjectURL(file)
      // this.$refs.pinch.toggleZoom()
    }
  },
  mounted () {
    // this.$refs.pinch.toggleZoom()
  }
}
</script>
