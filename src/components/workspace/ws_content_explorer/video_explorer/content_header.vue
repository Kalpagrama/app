<template lang="pug">
//- maxWidth: 'calc(100% - 16px)',
div(
  :style=`{
    position: 'absolute', zIndex: 99999, top: '0px', left: '0px',
    height: '60px',
    borderRadius: $store.state.ui.borderRadius+'px', overflow: 'hidden',
    background: $q.screen.xs ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.2)',
    maxWidth: 'calc(100% - 0px)',
  }`).row.full-width.items-center.content-center.q-pa-sm
  q-btn(
    round flat color="white" icon="keyboard_arrow_left" @click="$router.back()"
    :style=`{
    }`)
  .col
    .row.fit.items-center.q-px-sm
      span(
        v-if="true"
        ).text-white.text-bold {{ contentName }}
</template>

<script>
export default {
  name: 'contentHeader',
  props: ['stateExplorer'],
  data () {
    return {
    }
  },
  computed: {
    contentName () {
      return this.stateExplorer.content.name
    }
  }
}
</script>
