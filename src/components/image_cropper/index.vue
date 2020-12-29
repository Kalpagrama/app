<template lang="pug">
div(
  :style=`{
  }`
  ).row.fit.items-start.content-start
  //- image wrapper
  div(
    :style=`{
      //- position: 'relative',
      //- borderRadius: '10px', overflow: 'hidden',
    }`).row.fit
    //- crossorigin='anonymous'
    img(
      v-if="src"
      ref="cropRef"
      draggable="false"
      :src="src"
      :style=`{
        //- maxHeight: $q.screen.height/2+'px',
        //- objectFit: 'contain',
      }`
      ).fit
    //- slot()
  //- footer with actions
  //- TODO: add flip?
  //- .row.full-width.justify-center
    div(:style=`{maxWidth: 600+'px',}`).row.full-width.q-pa-sm
      q-btn(
        @click="cropper.setDragMode('move'), cropping = false"
        icon="open_with"
        round flat
        :color="cropping ? 'white' : 'green'")
      q-btn(
        @click="cropper.setDragMode('crop'), cropping = true"
        icon="crop"
        round flat
        :color="cropping ? 'green' : 'white'")
      .col
      small(v-if="cropper").text-white {{cropper.mode}}
      q-btn(
        @click="cropper.reset()"
        round flat color="white" icon="autorenew")
      .col
      q-btn(
        @click="cropper.rotate(90)"
        round flat color="white" icon="rotate_left")
      q-btn(
        @click="cropper.rotate(-90)"
        round flat color="white" icon="rotate_right")
</template>

<script>
import 'cropperjs/dist/cropper.css'
import Cropper from 'cropperjs'

export default {
  name: 'imageCropper',
  props: ['src', 'options'],
  data () {
    return {
      cropper: null,
      cropping: false,
    }
  },
  mounted () {
    this.$log('mounted')
    this.cropper = new Cropper(this.$refs.cropRef, {
      // aspectRatio: 16 / 9,
      // viewMode: 1,
      // initialAspectRatio: 10 / 10,
      viewMode: 2,
      dragMode: 'move',
      background: false,
      ...this.options,
      crop: (event) => {
        this.$emit('crop', event)
      }
    })
    this.$emit('cropper', this.cropper)
    // this.cropper.setDragMode('move')
  }
}
</script>
