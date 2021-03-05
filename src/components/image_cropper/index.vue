<template lang="pug">
div(
  :style=`{
    ...styles,
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
      crossorigin='anonymous'
      :src="src"
      :style=`{
        //- maxHeight: $q.screen.height/2+'px',
        //- objectFit: 'contain',
        ...styles,
      }`
      ).fit
</template>

<script>
import 'cropperjs/dist/cropper.css'
import Cropper from 'cropperjs'

export default {
  name: 'imageCropper',
  props: ['src', 'options', 'styles'],
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
      checkCrossOrigin: false,
      background: true,
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
