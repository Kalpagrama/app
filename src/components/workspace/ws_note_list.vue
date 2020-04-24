<template lang="pug">
div(:style=`{minHeight: '500px'}`).column.fit
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
