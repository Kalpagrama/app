<template lang="pug">
div(
  :style=`{borderRadius: $store.state.ui.borderRadius+'px', overflow: 'hidden'}`
  ).column.full-width.b-30
  //- header
  div(
    :style=`{borderRadius: '0 0 10px 10px', overflow: 'hidden'}`
    ).row.full-width.items-start.content-start
    .row.full-width.items-center.content-center.q-px-sm.q-py-md.b-50
      q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$emit('close')").q-mr-sm
      span.text-white.text-bold Chain editor
    .row.full-width.q-pa-sm
      q-input(
        v-model="name"
        filled dark color="grey-5"
        label="Chain name"
        ).full-width
  //- body
  .col.full-width.q-pa-sm
    div(:style=`{borderRadius: $store.state.ui.borderRadius+'px', overflow: 'hidden'}`).row.fit.b-60
  .col.full-width.q-pa-sm
    div(
      :style=`{borderRadius: $store.state.ui.borderRadius+'px', overflow: 'hidden'}`
      ).row.fit.items-center.content-center.justify-center.b-60
      q-btn(
        round flat color="green" icon="add"
        size="lg")
  div(:style=`{borderRadius: $store.state.ui.borderRadius+'px', overflow: 'hidden'}`).row.full-width.q-pa-sm.b-60
    q-btn(round flat dense color="grey-5" icon="menu")
</template>

<script>
export default {
  name: 'wsChainEditor',
  props: ['value'],
  data () {
    return {
      name: '',
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
