<template lang="pug">
div(
  :style=`{
    maxHeight: '500px',
    borderRadius: '10px',
    overflow: 'hidden',
  }`).column.fit.q-mt-sm.b-50
  .col.full-width
    .row.fit.items-center.content-center.justify-center
      span.text-white Coming soon
</template>

<script>
export default {
  name: 'wsNoteList',
  props: ['oid'],
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
