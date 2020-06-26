<template lang="pug">
div(:style=`{position: 'relative',}`).row.full-width.justify-center
  //- left drawer
  div(
    v-if="$slots.drawerLeft && $q.screen.width >= 1260"
    @wheel="onWheel"
    :style=`{
      position: 'fixed', zIndex: 8888, left: '0px', top: '8px', width: ($q.screen.width-800)/2+'px',
      pointerEvents: pointerEvents,
      height: 'calc(100% - 16px)',
    }`).row.items-start.content-start.justify-end.q-px-sm
    slot(name="drawerLeft")
  //- right drawer
  div(
    v-if="$slots.drawerRight && $q.screen.width >= 1260"
    @wheel="onWheel"
    :style=`{
      position: 'fixed', zIndex: 8888, right: '0px', top: '8px', width: ($q.screen.width-800)/2+'px',
      pointerEvents: rightDrawerScroll ? 'auto' : pointerEvents,
      height: 'calc(100% - 16px)',
    }`).row.items-start.content-start.justify-start.q-px-sm
    slot(name="drawerRight")
  //- footer
  div(
    v-if="$slots.footer && $q.screen.width  < 1260"
    @wheel="onWheel"
    :style=`{
      position: 'fixed', zIndex: 7777, bottom: '0px',
      pointerEvents: pointerEvents,
    }`).row.full-width.justify-center
    slot(name="footer")
  //- header
  div(
    v-if="$slots.header"
    @wheel="onWheel"
    :style=`{
      position: 'fixed', zIndex: 7777, top: '0px',
      pointerEvents: pointerEvents,
    }`).row.full-width.justify-center
    slot(name="header")
  slot(name="page")
</template>

<script>
export default {
  name: 'kalpaLayout',
  props: ['rightDrawerScroll'],
  data () {
    return {
      pointerEventsTimeout: null,
      pointerEvents: false,
    }
  },
  methods: {
    onWheel (e) {
      // this.$log('onWheel', e)
      if (this.pointerEventsTimeout !== undefined) clearTimeout(this.pointerEventsTimeout)
      this.pointerEvents = 'none'
      this.pointerEventsTimeout = setTimeout(() => {
        this.pointerEvents = 'auto'
      }, 100)
    },
  }
}
</script>
