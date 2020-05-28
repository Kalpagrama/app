<template lang="pug">
div(
  :class=`{
    'q-mt-sm': $q.screen.gt.xs
  }`
  :style=`{
    maxHeight: '500px',
    borderRadius: '10px',
    overflow: 'hidden',
  }`).column.fit
  //- header
  div(
    :style=`{
      borderRadius: $q.screen.xs ? '0 0 10px 10px' : '10px',
      overflow: 'hidden'
    }`
    ).row.full-width.items-center.content-center.q-pa-md.b-50
    q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$router.back()").q-mr-sm
    span(:style=`{fontSize: '20px'}`).text-white.text-bold Notes
  //- body
  .col.full-width.scroll
</template>

<script>
export default {
  name: 'wsNoteList',
  props: [],
  data () {
    return {
      notes: []
    }
  },
  methods: {
  },
  async mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
