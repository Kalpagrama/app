<template lang="pug">
div(
  @scroll="onScroll"
  v-if="$q.screen.width > $store.state.ui.maxWidthPage+$store.state.ui.maxWidthMenu*2"
  :style=`{
    position: 'fixed',
    top: '0px',
    zIndex: 1000,
    width: $store.state.ui.maxWidthMenu+'px',
    height: $q.screen.height+'px',
    right: ($q.screen.width-$store.state.ui.maxWidthPage)/2-$store.state.ui.maxWidthMenu+'px',
    paddingTop: '8px',
    overflow: 'auto'
  }`).row.items-start.content-start.q-px-sm.q-pb-sm
  slot()
</template>

<script>
export default {
  name: 'kalpaMenuRight',
  methods: {
    onScroll (e) {
      this.$log('onScroll', e)
    }
  }
}
</script>
