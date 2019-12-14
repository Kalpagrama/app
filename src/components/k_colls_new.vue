<template lang="pug">
div(
  ref="scrollWrapper"
  v-touch-pan.left.right.prevent.mouse="handlePan"
  @scroll="onScroll").row.full-width.scroll
  .row.full-width.no-wrap
    div(
      v-for="(c, ci) in 3" :key="n"
      :style=`{minWidth: '100%'}`
      ).row.full-width.items-start.content-start.q-px-sm
      div(
        v-for="(n, ni) in 30*c" :key="ni"
        :style=`{height: '450px'}`
        ).row.full-width.bg-white.q-mb-lg
        span node {{ni}}/{{ci}}
</template>

<script>
export default {
  name: 'kCollsNew',
  data () {
    return {
    }
  },
  methods: {
    handleSwipe (e) {
      this.$log('handleSwipe', e)
    },
    handlePan (e) {
      this.$log('handlePan', e)
      this.$refs.scrollWrapper.scrollLeft -= e.delta.x
      if (e.isFinal) {
        this.$log('PAN FINAL')
      }
      if (e.isFirst) {
        this.$log('PAN FIRST')
      }
    },
    goLeft () {
      this.$log('goLeft')
    },
    goRight () {
      this.$log('goRight')
    },
    onScroll (e) {
      this.$log('onScroll', e)
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
