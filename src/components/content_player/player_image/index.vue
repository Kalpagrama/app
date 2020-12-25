<template lang="pug">
div(
  :style=`{
    position: 'relative',
    ...styles,
  }`
  ).row.full-width
  img(
    draggable="false"
    :src="contentKalpa.url"
    :style=`{
      borderRadius: '10px',
      objectFit: 'contain',
      background: 'rgb(35,35,35)',
      ...styles
    }`
    ).full-width
</template>

<script>
export default {
  name: 'contentPlayer_image',
  props: ['contentKalpa', 'styles'],
  data () {
    return {
      currentPage: 0,
      figures: [],
      points: [],
    }
  },
  methods: {
    setState (key, val) {
      this.$log('setState', key, val)
      this[key] = val
    },
  },
  mounted () {
    this.$log('mounted')
    this.$emit('player', this)
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
