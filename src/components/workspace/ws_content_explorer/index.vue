<template lang="pug">
component(
  v-if="value"
  :is="component[value.contentType]"
  :content="value")
</template>

<script>

import videoExplorer from './video_explorer'
// import imageExplorer from './image_explorer'
// import webExplorer from './web_explorer'

export default {
  name: 'wsContentExplorer',
  props: ['value'],
  components: {videoExplorer},
  data () {
    return {
      component: {
        VIDEO: 'video-explorer',
        IMAGE: 'image-explorer',
        BOOK: 'book-explorer',
        WEB: 'web-explorer',
      }
    }
  },
  watch: {
  },
  mounted () {
    this.$log('mounted')
    this.$log('value', this.value)
  }
}
</script>
