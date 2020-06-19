<template lang="pug">
component(
  v-if="value"
  @close="$emit('close')"
  :is="component[value.contentType]"
  :ctx="ctx"
  :content="value")
</template>

<script>

import videoExplorer from './video_explorer'
// import imageExplorer from './image_explorer'
// import webExplorer from './web_explorer'

// value is content ws
export default {
  name: 'wsContentExplorer',
  components: {videoExplorer},
  props: {
    value: {type: Object},
    ctx: {
      type: String,
      default () {
        return 'workspace'
      }
    }
  },
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
