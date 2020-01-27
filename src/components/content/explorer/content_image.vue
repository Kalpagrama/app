<style>
.viewer-backdrop {
  background-color: black !important
}
.viewer-navbar {
  display: none
}
</style>

<template lang="pug">
.row.fit.items-center.justify-center.bg-black
  img(
    :src="content.url" v-viewer="{inline: true}"
    :style=`{width: '100%', height: '100%', objectFit: 'contain'}`)
</template>

<script>
export default {
  name: 'contentImage',
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
