<template lang="pug">
div(
  :style=`{
    position: 'absolute', zIndex: 99999, top: '0px', left: '0px',
    borderRadius: $store.state.ui.borderRadius+'px', overflow: 'hidden',
    background: 'rgb(0,0,0)',
    background: 'linear-gradient(0deg, rgba(0,0,0,0) 100%, rgba(10,10,10,0.9) 0%)',
    maxWidth: 'calc(100% - 0px)',
  }`).row.full-width.items-center.content-center.q-px-sm.q-py-md
  q-btn(
    @click="$emit('close')"
    round flat color="white" icon="keyboard_arrow_left"
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
