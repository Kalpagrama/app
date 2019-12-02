<template lang="pug">
div(:style=`{position: 'relative', height: $q.screen.height-60+'px'}`).column
  //- header
  div(
    :class="headerClass"
    :style=`{position: 'relative', overflow: 'hidden'}`).row.full-width
    slot(name="header")
  //- body
  div(ref="kSplitBody" :class="bodyClass" :style=`{position: 'relative'}` @scroll="onScroll").col.full-width.scroll
    slot(name="body")
</template>

<script>
export default {
  name: 'kSplit',
  props: ['width', 'height', 'headerMaxHeight', 'bodyClass', 'headerClass'],
  data () {
    return {
    }
  },
  methods: {
    onScroll (e) {
      // this.$logD('onScroll', e)
      this.$emit('scrollTop', e.target.scrollTop)
    },
    scrollTo (px) {
      // this.$refs.kSplitBody.scrollTop = px
      this.$tween.to(this.$refs.kSplitBody, 0.3, {scrollTop: px})
    }
  }
}
</script>
