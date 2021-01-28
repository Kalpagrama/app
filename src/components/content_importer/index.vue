<template lang="pug">
div(:style=`{borderRadius: '10px',}`).row.full-width.items-start.content-start.b-30
  //- content from url: youtube, image, vimeo, vk, already got contentKalpa
  div(
    v-if="contentKalpa && contentKalpa.type === 'VIDEO' && contentKalpa.contentSource === 'YOUTUBE'"
    ).row.full-width.items-start.content-start
    //- header
    div().row.full-width.items-center.content-center.q-py-sm.q-px-md
      span(:style=`{fontSize: '18px'}`).text-white.text-bold Добавить видео
      .col
      q-btn(round flat color="white" icon="clear" @click="$emit('close')")
    //- body
    img(
      :src="contentKalpa.thumbUrl" draggable="false"
      :style=`{
        borderRadius: '10px', overflow: 'hidden',
        //- minHeight: '300px',
      }`
      ).full-width.b-40
    //- footer edit youtube video name?
    .row.full-width.items-center.content-center.q-py-sm
      //- .row.full-height.items-start.content-start.q-px-sm
        q-icon(name="fab fa-youtube" color="white" size="40px")
      .col.q-pa-md
        span.text-bold.text-white {{ contentKalpa.name }}
    //- footer: actions
    .row.full-width.q-pa-sm.q-mt-md
      //- q-checkbox(v-model="allowAutoUpload_youtube" dark filled color="green").text-white Autoupload from YouTube
      .col
      q-btn(
        @click="$emit('contentKalpa', contentKalpa)"
        color="green" no-caps
        :loading="loading"
        ).q-px-md
        span.text-bold.text-white Добавить
  //- image from url?
  div(
    v-if="contentKalpa && contentKalpa.type === 'IMAGE' && contentKalpa.contentSource === 'KALPA'"
    ).row.full-width.items-start.content-start
    //- header
    div().row.full-width.items-center.content-center.q-pa-sm
      q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$emit('close')")
      span(:style=`{fontSize: '18px'}`).text-white.text-bold Add image to workspace
    //- body
    img(
      :src="contentKalpa.thumbUrl" draggable="false"
      :style=`{borderRadius: '10px', overflow: 'hidden'}`
      ).full-width
    //- footer edit youtube video name?
    .row.full-width.items-center.content-center.q-pa-md
      .col
      q-btn(
        @click="$emit('contentKalpa', contentKalpa)"
        color="green" no-caps
        :loading="loading"
        ).q-px-md Add
      //- q-icon(name="fab fa-youtube" color="white" size="40px").q-mr-sm
      //- span.text-bold.text-white {{ contentKalpa.name }}
  //- image content from file, crop it, rename it, them create contentKalpa, them emit content...
  image-from-device(
    v-if="contentFile && contentFile.type.split('/')[0] === 'image'"
    :nameInitial="contentFile.name"
    :src="imageSrc"
    @contentKalpa="$emit('contentKalpa', $event)")
  //- div(
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

import imageFromDevice from './image_from_device.vue'

export default {
  name: 'contentImporter',
  components: {
    imageFromDevice
  },
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
  }
}
</script>
