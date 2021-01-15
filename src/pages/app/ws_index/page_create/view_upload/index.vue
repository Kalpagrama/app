<template lang="pug">
.row.full-width
  div(
    :style=`{
      height: $q.screen.width+'px',
    }`
    ).row.full-width.items-center.content-center.justify-center
    q-btn(
      flat no-caps
      :style=`{
        height: '60px',
      }`
      ).b-40
      span.text-white Upload Image or Video
</template>

<script>
export default {
  name: 'pageCreate_viewUpload',
  data () {
    return {
    }
  }
}
</script>
