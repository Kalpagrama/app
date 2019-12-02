<template lang="pug">
.column.fit
  //- header
  div(
    v-if="!noHeader"
    :style=`{height: headerHeight+'px', overflow: 'hidden'}`).row.full-width
    div(:style=`{height: '60px'}`).row.full-width
      slot(name="header")
    div(v-if="true").row.full-width.items-center.justify-center
      q-spinner(color="accent" :size="40")
  div(v-if="!noActions"
    :style=`{position: 'absolute', zIndex: 1000, bottom: '0px', height: '78px'}`).row.full-width.items-center
    slot(name="actions")
  //- body with default slot
  div(
    v-touch-pan.down.prevent.mouse="scrollTop === 0 ? onPan : () => false"
    @scroll="onScroll"
    ).col.full-width.scroll
    slot
</template>

<script>
// TODO: deside inital position of header and its height

export default {
  name: 'kPage',
  props: ['noHeader', 'noBackBtn', 'noActions'],
  data () {
    return {
      scrollTop: 0,
      scrollHeight: 0,
      headerHeight: 60
    }
  },
  methods: {
    onScroll (e) {
      // this.$log('onScroll', e)
    },
    onPan (e) {
      // this.$log('handlePan', e)
      if (this.scrollTop === 0) return
      let to = this.headerHeight + e.delta.y
      if (to < 400) this.headerHeight = to
      if (e.isFinal) {
        if (to < 60) this.$tween.to(this, 0.2, {headerHeight: 0})
        else this.$tween.to(this, 0.2, {headerHeight: 60})
      }
    }
  }
}
</script>
