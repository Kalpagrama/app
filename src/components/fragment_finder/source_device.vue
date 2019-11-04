<template lang="pug">
.row.full-width.justify-center.q-px-md.q-mt-lg
  .row.full-width.q-pa-sm
    span.text-bold Upload from device
  div(:style=`{height: '50px', borderRadius: '10px', overflow: 'hidden'}`
    ).row.full-width.items-center.justify-center.bg-grey-2
    q-icon(name="add" color="grey-10" size="24px")
</template>

<script>
export default {
  name: 'fragmentFinder__sourceDevice',
  data () {
    return {
      file: null
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
