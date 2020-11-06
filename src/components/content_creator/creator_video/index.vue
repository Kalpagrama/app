<template lang="pug">
.row.full-width.justify-center
  div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width.items-start.content-start
    div(
      v-for="(i,ii) in 100" :key="ii"
      :style=`{
        height: '40px',
      }`
      ).row.full-width
</template>

<script>
export default {
  name: 'contentCreator_video',
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
