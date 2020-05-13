<template lang="pug">
div(:style=`{maxHeight: '500px', borderRadius: '0 0 10px 10px'}`).column.fit.b-70
  .col.full-width
    .row.fit.items-center.content-center.justify-center
      small.text-white Coming soon
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
