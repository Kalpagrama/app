<template lang="pug">
q-layout(view="hHh lpR fFf")
  q-page-container.bg-grey-10
    node(v-if="node" ctx="explorer" :node="node" :needFull="true" :visible="true" :active="true" layout="rubick")
</template>

<script>
export default {
  name: 'pageAppNode',
  components: {},
  data () {
    return {
      node: null
    }
  },
  computed: {
  },
  watch: {
    '$route.params.oid': {
      immediate: true,
      async handler (to, from) {
        this.$log('$route.params.oid CHANGED', to)
        this.node = await this.nodeLoad(to)
      }
    }
  },
  methods: {
    async nodeLoad (oid) {
      this.$log('nodeLoad start', oid)
      let node = await this.$store.dispatch('objects/get', { oid, priority: 0 })
      this.$log('nodeLoad done', node)
      return node
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

<style lang="stylus" scoped>
</style>
