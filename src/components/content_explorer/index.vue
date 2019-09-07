<template lang="pug">
div(:style=`{height: $q.screen.gt.sm ? '100vh' : 'calc(100vh - 60px)'}`).row.full-width
  content-video(v-if="content && content.type === 'VIDEO'" :content="content")
  //- content-image
  //- content-book
</template>

<script>
import contentVideo from './content_video'

export default {
  name: 'contentExplorer',
  components: {contentVideo},
  props: ['content'],
  data () {
    return {
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
