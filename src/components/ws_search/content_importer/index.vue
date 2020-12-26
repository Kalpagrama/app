<template lang="pug">
q-layout(
  view="hHh Lpr lff"
  container).b-30
  q-header(reveal).b-30
    .row.full-width.q-pt-sm.q-px-sm
      div(
        :style=`{
          maxWidth: $store.state.ui.pageWidth+'px', height: '60px',
          borderRadius: '10px',
        }`
        ).row.full-width.items-center.content-center.q-px-sm
        .col.q-px-sm
          span(:style=`{fontSize: '18px',}`).text-white.text-bold Загрузить контент
        q-btn(round flat color="white" icon="clear" @click="$emit('close')")
  q-page-container
    q-page.row.full-width.items-start.content-start.q-pa-sm
      from-device-image(
        v-if="contentFile && contentFile.type.split('/')[0] === 'image'"
        :contentFile="contentFile"
        @contentKalpa="$emit('contentKalpa', $event), $emit('close')")
      from-device-video(
        v-if="contentFile && contentFile.type.split('/')[0] === 'video'"
        :contentFile="contentFile"
        @contentKalpa="$emit('contentKalpa', $event), $emit('close')")
      from-device-book(
        v-if="contentFile && contentFile.type === 'application/epub+zip'"
        :contentFile="contentFile"
        @contentKalpa="$emit('contentKalpa', $event), $emit('close')")
</template>

<script>
import fromDeviceImage from './from_device_image.vue'
import fromDeviceVideo from './from_device_video.vue'
import fromDeviceBook from './from_device_book.vue'

export default {
  name: 'contentImporter',
  props: {
    contentFile: {type: Object}
  },
  components: {
    fromDeviceImage,
    fromDeviceVideo,
    fromDeviceBook
  },
  data () {
    return {
    }
  },
  mounted () {
    this.$log('mounted')
  }
}
</script>
