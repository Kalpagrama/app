<template lang="pug">
.row.full-width.items-start.content-start.justify-center
  video(
    ref="videoRef"
    :src="url"
    type="video/mp4"
    :playsinline="true"
    :autoplay="true"
    :loop="true"
    :style=`{}`
    ).fit
</template>

<script>
export default {
  name: 'wsVideoExplorer_playerKalpa',
  props: ['url'],
  data () {
    return {
    }
  }
}
</script>
