<template lang="pug">
component(:is="options.footerOverlay ? 'video-feed-overlay' : item.type === 'VIDEO' ? 'video-overlay' : 'video-overlay'" :item="item" :player="player")
</template>
// content-video-overlay
// node-video-overlay
// default-overlay

<script>
import videoOverlay from './video'
import videoFeedOverlay from './video_feed'
export default {
  name: 'itemOverlay',
  props: ['item', 'player', 'options'],
  components: {
    videoOverlay,
    videoFeedOverlay
  },
  // emits: ['play', 'pause']
}
</script>
