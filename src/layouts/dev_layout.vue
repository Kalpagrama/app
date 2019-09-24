<template lang='pug'>
q-layout(view='hHh Lpr fFf').bg-primary
  q-page-container
    q-page
      .row.window-height
        //- video-editor(:content="content")
        h1(
          :style=`{
            color: 'red',
            'hover':  '{color: green !important}'
          }`) hello
</template>

<script>
import videoEditor from 'components/video_editor'

export default {
  name: 'devLayout',
  components: {videoEditor},
  data () {
    return {
      content: {
        duration: 471.18,
        name: 'ЧЕРНАЯ трасса в Италии',
        oid: 'AgSuHZGAoCI=',
        thumbUrl: ['https://storage.yandexcloud.net/kalpa1-thumbs/n9/yq/145432530001109026_600.jpg'],
        type: 'VIDEO',
        url: 'https://test.kalpagramma.com/local_object_storage/content/n9/yq/145432530001109026.mp4',
        urlOriginal: 'https://www.youtube.com/watch?v=xP3XpZoWE2c',
      }
    }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
