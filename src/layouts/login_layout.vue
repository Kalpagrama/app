<template lang="pug">
q-layout(view='lHh Lpr lFf' :style=`{height: height+'px'}` @resize="handleResize")
  q-header.bg-white
    div(style=`height: 250px; borderBottom: 1px solid #eee` @click="$router.push({name: 'index'})").row.full-width.items-center.content-center.justify-center
      div(style=`height: 150px; width: 150px; borderRadius: 50%`).row.items-center.justify-center.bg-primary
        q-icon(name="vertical_align_center" color="white" size="80px")
      .row.full-width.justify-center
        h6.q-ma-xs.text-black.text-bold kalpagramma
  q-page-container.fit
      q-page.fit
        router-view
</template>

<script>
export default {
  name: 'loginLayout',
  data () {
    return {
      height: window.innerHeight,
      width: window.innerWidth,
    }
  },
  methods: {
    handleResize (e) {
      this.height = e.height
      this.width = e.width
    }
  },
  mounted () {
    this.$log('mounted', this.$route)
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>

<style lang="stylus">
</style>
