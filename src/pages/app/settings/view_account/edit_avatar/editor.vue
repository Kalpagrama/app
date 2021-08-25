<template lang="pug">
q-layout(
  view="lHh lpR lFf"
  :container="false"
  ).b-30
  q-header.b-30
    .row.full-width.justify-center
      div(:style=`{maxWidth: $store.state.ui.pageWidth+'px',}`).row.full-width.items-center.content-center.q-pa-sm
        q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$emit('close')")
        span(:style=`{fontSize: '18px'}`).text-white.text-bold {{$t('Avatar editor')}}
  q-footer.b-30
    .row.full-width.justify-center
      div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width.q-pa-sm
        q-btn(color="green" no-caps @click="save()").full-width {{$t('Save')}}
  q-page-container
    q-page().row.full-width.justify-center
      div(
        :style=`{
          position: 'relative',
          maxWidth: $store.state.ui.pageWidth+'px'
        }`).row.full-width.items-start.content-start
        image-cropper(
          ref="imageCropper"
          :src="avatarUrl"
          :options=`{
            viewMode: 1,
            aspectRatio: 1/1,
            minCropBoxHeight: 100,
            minCropBoxWidth: 100,
            //- background: 'rgb(30,30,30)',
          }`)
</template>

<script>

import imageCropper from 'src/components/image_cropper/index.vue'

export default {
  name: 'editAvatar_editor',
  components: {imageCropper},
  props: ['oid', 'avatarUrl'],
  data () {
    return {
      saving: false,
    }
  },
  methods: {
    async save () {
      try {
        this.$log('save')
        this.saving = true
        // await this.$wait(400)
        this.$refs.imageCropper.cropper.getCroppedCanvas()
          .toBlob(async (blob) => {
            this.$log('save blob', blob)
            this.saving = false
            let file = new File([blob], 'user_avatar_' + Date.now().toString())
            this.$emit('avatar', file)
          })
      }
      catch (e) {
        this.$log('save error', e)
        this.saving = false
      }
    }
  }
}
</script>
