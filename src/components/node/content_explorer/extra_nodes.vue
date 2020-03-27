<template lang="pug">
.column.fit
  div(v-if="false" :style=`{height: '60px'}`).row.full-width.items-center.content-center.q-px-md
    span.text-bold.text-green Related nodes
  .col.full-width.scroll
    kalpa-loader(v-if="sphereOid" type="sphereNodes" :variables="variables" ref="contentNodesLoader")
      template(v-slot:items=`{items}`)
        node-list(:nodes="items" @nodeMiddle="nodeMiddle")
</template>

<script>
export default {
  name: 'contentExplorer_extraNodes',
  props: ['mode', 'content'],
  data () {
    return {
    }
  },
  computed: {
    sphereOid () {
      return this.content.oid
    },
    variables () {
      return {
        oid: this.sphereOid,
        pagination: { pageSize: 10 },
        sortStrategy: 'HOT',
        filter: { types: 'NODE' }
      }
    }
  },
  methods: {
    nodeMiddle (index) {
      this.$log('nodeMiddle')
      let node = this.$refs.contentNodesLoader.query.items[index]
      this.$log('node.name', node.name)
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
