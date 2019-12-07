<template lang="pug">
.column.fit
  //- header
  transition(appear enter-active-class="animated slideInDown" leave-active-class="animated slideOutUp")
    div(
      v-if="true"
      :style=`{height: headerHeight+'px', overflow: 'hidden'}`).row.full-width
      slot(name="header")
  //- body
  //- v-touch-pan.down.prevent.mouse="onPan"
  div(
    ref="kPageScroll"
    :style=`{position: 'relative'}`
    @scroll="onScroll"
    ).col.full-width.scroll
    slot
  //- footer
  transition(appear enter-active-class="animated slideInDown" leave-active-class="animated slideOutUp")
    div(
      v-if="!noFooter"
      :style=`{height: footerHeight+'px', overflow: 'hidden'}`).row.full-width
      slot(name="footer")
</template>

<script>
// TODO: deside inital position of header and its height

export default {
  name: 'kPage',
  props: ['noHeader', 'noFooter', 'noBackBtn', 'noActions', 'noPan'],
  data () {
    return {
      scrollTop: 0,
      scrollHeight: 0,
      headerShowLocal: true,
      headerHeight: 60,
      footerHeight: 60
    }
  },
  computed: {
    headerShow () {
      if (this.noHeader) return false
      else return this.headerShowLocal
    }
  },
  methods: {
    onScroll (e) {
      // this.$logD('onScroll', e)
      let scrollTop = this.$refs.kPageScroll.scrollTop
      if (this.scrollTop > scrollTop) this.headerShowLocal = false
      this.scrollTop = scrollTop
    },
    onPan (e) {
      if (this.noPan) return
      if (this.scrollTop > 0) return
      this.$logD('handlePan', e)
      // if (this.scrollTop === 0) return
      // manipulate header or footer
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
