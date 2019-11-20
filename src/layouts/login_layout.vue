<template lang="pug">
q-layout(view='lHh Lpr lFf' :style=`{height: height+'px'}` @resize="handleResize").bg-white
  q-header.bg-white
    div(:style=`{height: width+'px', maxHeight: '500px'}` @click="$router.push({name: 'index'})").row.full-width.items-center.content-center.justify-center
      div(style=`height: 200px; width: 200px; borderRadius: 50%`).row.items-center.justify-center.bg-primary
        k-logo(:width="200" :height="200").logo
      .row.full-width.justify-center
        h5.q-ma-md.text-black.text-bold Кальпаграмма
  q-page-container
    q-page
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
