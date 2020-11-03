<template lang="pug">
.row.full-width.items-start.content-start
  video(
    v-if="src"
    loop
    autoplay
    :src="src"
    :style=`{
      borderRadius: '10px',
      overflow: 'hidden',
    }`
    ).full-width
  .row.full-width
    .col
    q-btn(color="green" no-caps) Upload
</template>

<script>
export default {
  name: 'contentImporter_fromDeviceImage',
  props: ['contentFile'],
  data () {
    return {
      src: null,
    }
  },
  watch: {
    contentFile: {
      deep: true,
      immediate: true,
      handler (to, from) {
        this.$log('contentFile TO', to)
        if (to) {
          this.src = URL.createObjectURL(to)
        }
      }
    }
  },
}
</script>
