<template lang="pug">
.row.full-width.items-start.content-start
  .row.full-width
    div(:style=`{position: 'relative',borderRadius: '10px',overflow: 'hidden'}`).row.full-width
      q-input(
        v-model="name"
        outlined dark color="green"
        placeholder="Название или URL"
        ).full-width
  //- body
  div(:style=`{position: 'relative',}`).row.full-width.items-start.content-start.q-py-sm
    image-cropper(
      v-if="src"
      ref="imageCropper"
      :src="src"
      :options=`{
        viewMode: 1,
        initialAspectRatio: 10/10,
        minCropBoxHeight: 100,
        minCropBoxWidth: 100,
        autoCrop: false,
        dragMode: 'move',
        background: false,
      }`
      @crop="imageCropped"
      :style=`{
        border: imageValid ? 'none' : '2px solid red',
        borderRadius: '10px', overflow: 'hidden',
      }`)
  //- footer
  .row.full-width.justify-center
    div(:style=`{maxWidth: '100%'}`).row.full-width
      .col
      q-btn(
        @click="imageSave"
        no-caps
        :color="imageValid ? 'green' : 'red'"
        :disable="!imageValid"
        :loading="loading").q-px-sm
        span.text-white.text-bold Загрузить
</template>

<script>
import { ContentApi } from 'src/api/content'

import imageCropper from 'components/image_cropper/index.vue'

export default {
  name: 'contentImporter_fromDeviceImage',
  components: {imageCropper},
  props: ['contentFile'],
  data () {
    return {
      loading: false,
      imageSrc: null,
      imageValid: true,
      imageEditing: false,
      name: '',
      src: null,
    }
  },
  watch: {
    contentFile: {
      deep: true,
      immediate: true,
      handler (to, from) {
        this.$log('contentFile TO', to)
        if (to) {
          this.src = URL.createObjectURL(to)
        }
      }
    }
  },
  methods: {
    imageCropped (e) {
      let wh = event.detail.width / event.detail.height
      let hw = event.detail.height / event.detail.width
      // this.$log('wh/hw', wh, hw)
      if (wh < 0.5 || hw < 0.5) {
        this.imageValid = false
      }
      else {
        if (!this.imageValid) this.imageValid = true
      }
    },
    async imageSave () {
      this.$log('imageSave start', this.name)
      this.loading = true
      this.$refs.imageCropper.cropper.getCroppedCanvas({ maxWidth: 1920, maxHeight: 1080 })
        .toBlob(async (blob) => {
          this.$log('imageSave blob size=', blob.size)
          blob.name = this.name
          let contentKalpa = await ContentApi.contentCreateFromFile(blob)
          await this.$wait(300)
          this.$log('imageSave contentKalpa', contentKalpa)
          this.loading = false
          this.$emit('contentKalpa', contentKalpa)
        })
    }
  }
}
</script>
