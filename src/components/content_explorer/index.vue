<template lang="pug">
.row.fit
  content-video(v-if="content && content.type === 'VIDEO'" :content="content" :inEditor="inEditor")
  //- content-image
  //- content-book
</template>

<script>
import contentVideo from './content_video'

export default {
  name: 'contentExplorer',
  components: {contentVideo},
  props: {
    content: {type: Object},
    inEditor: {type: Boolean, default () { return false }}
  },
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
