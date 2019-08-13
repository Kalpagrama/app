<template lang="pug">
video-editor
</template>

<script>
import videoEditor from 'components/video_editor'

export default {
  name: 'devLayout',
  components: {videoEditor},
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
