<template lang="pug">
div(
  :style=`{borderRadius: '10px', overflow: 'hidden'}`
  ).column.full-width.b-30
  //- header
  div(
    :style=`{borderRadius: '0 0 10px 10px', overflow: 'hidden'}`
    ).row.full-width.items-start.content-start
    .row.full-width.items-center.content-center.q-px-sm.q-py-md.b-50
      q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$emit('close')").q-mr-sm
      span.text-white.text-bold Chain editor
  //- body
  .col.full-width
    .row.full-width.q-pa-md
      span.text-white {{ value }}
</template>

<script>
export default {
  name: 'wsChainEditor',
  props: ['value'],
  data () {
    return {
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
