<template lang="pug">
q-page(
  :style=`{paddingTop: '60px'}`
  ).row.full-width.items-start.content-start.justify-center
  div(:style=`{maxWidth: '800px',}`).row.full-width.items-start.content-start
    small.text-white {{ contentKalpa }}
</template>

<script>
export default {
  name: 'wsContentExplorer_video_viewDetails',
  props: ['contentKalpa', 'contentWorkspace'],
  data () {
    return {
    }
  }
}
</script>
