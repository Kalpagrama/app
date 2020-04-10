<template lang="pug">
.column.fit
  div(
    ref="extraExploreScroll"
    :style=`{overflow: 'hidden'}`).col.full-width.scroll
    div(
      v-touch-swipe.mouse.prevent.vertical="onSwipe"
      ).row.fit.items-start.content-start
      chain-byte-item(
        v-for="(c,ci) in chains" :key="ci" :chain="c" :nodeExplore="node"
        :style=`{paddingBottom: '54px'}`
      )
</template>

<script>
import chainByteItem from './chain_byte_item'

export default {
  name: 'extraExplore_chainByte',
  components: {chainByteItem},
  props: ['node', 'chains'],
  data () {
    return {
    }
  },
  methods: {
    onSwipe (e) {
      // this.$log('onSwipe', e)
      // this.$q.notify('on swipe:' + e.direction)
      let ref = this.$refs.extraExploreScroll
      let to = e.direction === 'up' ? ref.scrollTop + ref.clientHeight : ref.scrollTop - ref.clientHeight
      this.$tween.to(this.$refs.extraExploreScroll, 0.3, {scrollTop: to})
    },
    onScroll (e) {
      // this.$log('onScroll', e)
      let to = e.target.scrollTop
      if (to > this.scrollTop) this.scrollDirection = 'down'
      else this.scrollDirection = 'up'
      this.scrollTop = to
      if (this.scrollDirection === 'down' && to - this.scrollTopDirection > 60) this.headerShow = false
    }
  }
}
</script>
