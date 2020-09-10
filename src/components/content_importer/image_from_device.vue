<template lang="pug">
.row.full-width
  //- header
  div().row.full-width.items-center.content-center.q-pa-sm
    q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$emit('close')")
    span(:style=`{fontSize: '18px'}`).text-white.text-bold Add image to workspace
  //- TODO: set name?
  //- body
  div(:style=`{position: 'relative',}`).row.full-width.items-start.content-start
    image-cropper(
      v-if="src"
      ref="imageCropper"
      :src="src"
      :options=`{
        viewMode: 1,
        initialAspectRatio: 10/10,
        minCropBoxHeight: 100,
        minCropBoxWidth: 100,
      }`
      @crop="imageCropped"
      :style=`{
        border: imageValid ? 'none' : '2px solid red',
        borderRadius: '10px', overflow: 'hidden',
      }`)
  //- footer
  .row.full-width.q-pa-sm
    .col
    q-btn(
      @click="imageSave"
      no-caps
      :color="imageValid ? 'green' : 'red'"
      :disable="!imageValid"
      :loading="loading").q-px-md Add
</template>

<script>
import { ContentApi } from 'src/api/content'

import imageCropper from 'components/image_cropper/index.vue'

export default {
  name: 'imageFromDevice',
  components: {imageCropper},
  props: ['src'],
  data () {
    return {
      loading: false,
      imageSrc: null,
      imageValid: false,
    }
  },
  methods: {
    imageCropped (e) {
      let wh = event.detail.width / event.detail.height
      let hw = event.detail.height / event.detail.width
      this.$log('wh/hw', wh, hw)
      if (wh < 0.5 || hw < 0.5) {
        this.imageValid = false
      }
      else {
        if (!this.imageValid) this.imageValid = true
      }
    },
    async imageSave () {
      this.$log('imageSave start')
      this.loading = true
      this.$refs.imageCropper.cropper.getCroppedCanvas({ maxWidth: 1920, maxHeight: 1080 })
        .toBlob(async (blob) => {
          this.$log('imageSave blob size=', blob.size)
          let contentKalpa = await ContentApi.contentCreateFromFile(blob)
          this.$log('imageSave contentKalpa', contentKalpa)
          this.$emit('contentKalpa', contentKalpa)
        })
    }
  },
  mounted () {
    this.$log('mounted')
  }
}
</script>
