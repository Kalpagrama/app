<template lang="pug">
component(:is="item.type === 'VIDEO' ? 'video-overlay' : 'video-overlay'" :item="item" :player="player")
</template>
// content-video-overlay
// node-video-overlay
// default-overlay

<script>
import videoOverlay from './video'
export default {
  name: 'itemOverlay',
  props: ['item', 'player'],
  components: {
    videoOverlay
  },
  // emits: ['play', 'pause']
}
</script>
