<template lang="pug">
div(:style=`{position: 'relative'}`).row.full-width.bg-red
  //- fullscreen
  q-btn(
    v-if="active" @click="toggleFullscreen()"
    round flat icon="fullscreen" color="white"
    :style=`{position: 'absolute', left: '8px', bottom: '8px'}`).shadow-1
  span nodeImage
</template>

<script>
export default {
  name: 'nodeImage',
  data () {
    return {
    }
  },
  methods: {
    toggleFullscreen () {
      this.$log('toggleFullscreen')
    }
  }
}
</script>
