<template lang="pug">
.row.full-width
  router-link(
    :to="s.oid ? '/sphere/'+s.oid : null"
    ).q-mr-xs.q-mb-xs.q-py-xs.q-px-sm
    small(:style=`{userSelect: 'none'}`).text-white {{ s.name }}
</template>

<script>
export default {
  name: 'sphereList',
  props: ['spheres', 'sphereStyle'],
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
