<template lang="pug">
div(:style=`{borderRadius: '10px',}`).row.full-width.b-30
  //- content from url: youtube, image, vimeo, vk, already got contentKalpa
  div(
    v-if="contentKalpa && contentKalpa.type === 'VIDEO' && contentKalpa.contentSource === 'YOUTUBE'"
    ).row.full-width
    //- header
    div().row.full-width.items-center.content-center.q-pa-sm
      q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$emit('close')")
      span(:style=`{fontSize: '18px'}`).text-white.text-bold Add video to workspace
    //- body
    img(
      :src="contentKalpa.thumbUrl" draggable="false"
      :style=`{borderRadius: '10px', overflow: 'hidden'}`
      ).full-width
    //- footer edit youtube video name?
    .row.full-width.items-center.content-center.q-pa-md
      q-icon(name="fab fa-youtube" color="white" size="40px").q-mr-sm
      span.text-bold.text-white {{ contentKalpa.name }}
    //- footer: actions
    .row.full-width.q-pa-sm
      q-checkbox(v-model="allowAutoUpload_youtube" dark filled color="green").text-white Autoupload from YouTube
      .col
      q-btn(
        @click="$emit('contentKalpa', contentKalpa)"
        color="green" no-caps
        :loading="loading"
        ).q-px-md Add
  //- content from file, crop it, rename it, them create contentKalpa, them emit content...
  div(
    v-if="contentFile && contentFile.type.split('/')[0] === 'image'"
    ).row.full-width
    //- header
    div().row.full-width.items-center.content-center.q-pa-sm
      q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$emit('close')")
      span(:style=`{fontSize: '18px'}`).text-white.text-bold Add image to workspace
    //- TODO: set name?
    //- body
    div(:style=`{position: 'relative',}`).row.full-width.items-start.content-start
      image-cropper(
        v-if="imageSrc"
        ref="imageCropper"
        :src="imageSrc"
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
import assert from 'assert'

export default {
  name: 'contentImporter',
  components: {imageCropper},
  props: {
    contentKalpa: {type: Object},
    contentFile: {type: [String, Object]}
  },
  data () {
    return {
      // all
      loading: false,
      // video youtube
      allowAutoUpload_youtube: false,
      // video device
      // image
      imageSrc: null,
      imageValid: false,
      // image url
    }
  },
  watch: {
    contentFile: {
      deep: true,
      immediate: true,
      handler (to, from) {
        this.$log('contentFile TO', to)
        if (to) {
          if (to.type.split('/')[0] === 'image') {
            this.imageSrc = URL.createObjectURL(to)
          }
        }
      }
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

    async imageCompress(){

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
  }
}
</script>
