<template lang='pug'>
.row.full-width devLayout
</template>

<script>
export default {
  name: 'devLayout',
  components: {},
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
