<template lang="pug">
div(:style=`{position: 'relative'}`).row.fit.bg-black
  img(:src="content.url" v-viewer=`{inline: true}`
    :style=`{width: '100%', height: '100%', objectFit: 'contain', opacity: 0}`)
</template>

<script>
export default {
  name: 'editorImage',
  props: ['composition', 'content'],
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
