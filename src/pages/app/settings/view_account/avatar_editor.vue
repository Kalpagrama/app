<template lang="pug">
q-layout(view="lHh lpR lFf").b-30
  q-page-container
    q-page().row.full-width.justify-center
      div(:style=`{position: 'relative', maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width.items-start.content-start
        //- header
        div().row.full-width.items-center.content-center.q-pa-sm
          q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$emit('close')")
          span(:style=`{fontSize: '18px'}`).text-white.text-bold Edit avatar
        image-cropper(
          v-if="avatarUrl"
          ref="imageCropper"
          :src="avatarUrl"
          :options=`{
            viewMode: 1,
            aspectRatio: 1/1,
            minCropBoxHeight: 100,
            minCropBoxWidth: 100,
          }`)
        //- h1 image cropper here
        .row.full-width.q-pa-sm
          .col
          q-btn(color="green" no-caps @click="save()") Save
</template>

<script>
import { ObjectsApi } from 'src/api/objects'

import imageCropper from 'components/image_cropper/index.vue'

export default {
  name: 'viewAccount_avatarEditor',
  components: {imageCropper},
  props: ['oid', 'avatarUrl'],
  methods: {
    async save () {
      this.$log('save')
      this.$refs.imageCropper.cropper.getCroppedCanvas()
        .toBlob(async (blob) => {
          this.$log('save blob', blob)
          let file = new File([blob], 'user_avatar_' + Date.now().toString())
          this.$log('save file', file)
          await ObjectsApi.update(this.oid, 'profile.photo', file)
          this.$emit('close')
        })
    }
  }
}
</script>
