<template lang="pug">
q-layout(
  view="hHh lpR fFf"
  :style=`{height: $q.screen.height+'px'}`)
  q-page-conainter.row.fit.justify-center.items-start.content-start.bg-grey-9
    kalpa-loader(v-if="sphereOid" type="sphereNodes" :variables="variables")
      template(v-slot:items=`{items}`)
        node-list(:nodes="items")
</template>

<script>
export default {
  name: 'pageAppHome',
  props: [],
  data () {
    return {
    }
  },
  computed: {
    sphereOid () {
      return this.$store.getters.currentUser.oid
    },
    variables () {
      return {
        oid: this.sphereOid,
        pagination: { pageSize: 100 },
        sortStrategy: 'HOT',
        filter: { types: 'NODE' }
      }
    },
  },
  mounted () {
    this.$log('mounted')
    // TODO document set body color
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
