<template lang="pug">
div(:style=`{position: 'relative'}`).column.fit
  //- header
  //- body
  div(
    ref="itemsScrollWrapper"
    ).col.full-width.scroll
    .row.full-width.justify-center
      div(
        :style=`{
          maxWidth: $store.state.ui.maxWidthPage+'px',
          paddingTop: paddingTop+'px',
          paddingBottom: paddingBottom+'px'
        }`
        ).row.fit.items-start.content-start.justify-start
        div(
          v-for="(i,ii) in items" :key="i.oid" :accessKey="ii"
          :ref="`node-`+i.oid"
          :style=`{
            position: 'relative'
          }`
          v-observe-visibility=`{
            callback: indexMiddleHandler,
            throttle: 150,
            intersection: {
              rootMargin: -($q.screen.height/2-10)+'px 0px'
            }
          }`
          ).row.full-width.q-mb-xl
          //- img(:src="i.meta.items[0].thumbUrl" :style=`{}`).full-width
          slot(
            name="item"
            :item="i"
            :index="ii"
            :indexMiddle="indexMiddle")
</template>

<script>
export default {
  name: 'listMiddle',
  props: ['items', 'index', 'oid'],
  data () {
    return {
      indexMiddle: 0,
      scrollTop: 0,
      paddingTop: 0,
      paddingBottom: 0
    }
  },
  watch: {
    indexMiddle: {
      immediate: false,
      handler (to, from) {
        this.$log('indexMiddle CHANGED', to)
        // this.$emit('nodeMiddle', to)
      }
    },
    // nodeIndex: {
    //   handler (to, from) {
    //     if (to >= 0) {
    //       this.$log('nodeIndex', to)
    //       this.scrollToIndex(to)
    //     }
    //   }
    // }
  },
  methods: {
    indexMiddleHandler (isVisible, entry, i) {
      // this.$log('itemMiddleHandler', isVisible, entry, i)
      if (isVisible) {
        let index
        if (i >= 0) index = i
        else index = parseInt(entry.target.accessKey)
        this.$log('indexMiddleHandler index', index)
        this.indexMiddle = index
      }
    },
    onSwipe (e, i) {
      this.$log('onSwipe', e)
      let indexTo = i >= 0 ? i : e.direction === 'up' ? this.indexMiddle + 1 : this.indexMiddle - 1
      this.$log('onSwipe indexTo', indexTo)
      if (indexTo < 0 || indexTo > this.items.length - 1) return
      let nodeToOid = this.items[indexTo].oid
      this.$log('onSwipe nodeToOid', nodeToOid, this.items[indexTo].name)
      let nodeToRef = this.$refs[`node-${nodeToOid}`][0]
      this.$log('onSwipe nodeToRef', nodeToRef)
      let nodeToOffsetTop = nodeToRef.$el.offsetTop
      this.$log('onSwipe nodeToOffsetTop', nodeToOffsetTop)
      let nodeToClientHeight = nodeToRef.$el.clientHeight
      this.$log('onSwipe nodeToClientHeight', nodeToClientHeight)
      let scrollToDelta = (this.$refs.itemsScrollWrapper.clientHeight - nodeToClientHeight) / 2
      this.$log('onSwipe scrollToDelta', scrollToDelta)
      let scrollTo = nodeToOffsetTop - scrollToDelta
      this.$tween.to(this.$refs.itemsScrollWrapper, 0.4, {scrollTop: scrollTo})
    },
    scrollToIndex (indx) {
      this.$log('scrollToIndex', indx)
      if (indx === null) return
      let oid = this.items[indx].oid
      this.$log('oid', oid)
      let ref = this.$refs[`node-${oid}`][0]
      this.$log('ref', ref)
      let offsetTop = ref.$el.offsetTop
      this.$log('offsetTop', offsetTop)
      this.$tween.to(this.$refs.nodeListMiddleScroll, 0.4, {scrollTop: offsetTop})
    }
  },
  mounted () {
    this.$log('mounted')
    // window.onkeydown = (e) => {
    //   if (e.keyCode === 32) {
    //     this.onSwipe({direction: 'up'})
    //   }
    // }
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
