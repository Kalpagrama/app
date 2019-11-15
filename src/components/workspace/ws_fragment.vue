<template lang="pug">
.column.fit.bg-white
  div(:style=`{height: '60px'}`).row.full-width
    .col.full-height
      .row.fit.items-center.q-px-md
        span.text-bold Новый фрагмент
    div(:style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
      q-btn(round flat icon="clear" @click="$emit('hide')")
  .col.full-width.scroll
    .row.full-width.items-start.content-start
      small {{ fragment }}
</template>

<script>
export default {
  name: 'wsFragment',
  data () {
    return {
      mode: 'create',
      modes: {
        create: {},
        update: {}
      },
      fragment: null
    }
  },
  mounted () {
    this.$log('mounted', this.$store.state.ui.fragment)
    this.$log('node', this.$store.state.ui.node)
    this.fragment = JSON.parse(JSON.stringify(this.$store.state.ui.fragment))
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    this.$store.commit('ui/stateSet', ['fragment', null])
    this.$store.commit('ui/stateSet', ['node', null])
  }
}
</script>
