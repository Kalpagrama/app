<template lang="pug">
.row.fit
  .column.fit
    //- header with filters...
    .row.full-width
      .col.full-height
      div(:style=`{width: '60px', height: '60px'}`
        ).row.items-center.content-center.justify-center
        q-btn(round flat color="green" icon="refresh" @click="nodesReload()")
    //- body
    .col.full-width.scroll
      .row.full-width.items-start.content-start
        div(
          v-for="(n,ni) in nodesFiltered" :key="ni"
          :style=`{height: '400px'}`
          ).row.full-width.items-center
          span node {{ ni }}
</template>

<script>
export default {
  name: 'wsNodes',
  data () {
    return {
      nodes: []
    }
  },
  computed: {
    nodesFiltered () {
      return this.nodes
    }
  },
  methods: {
    async nodesLoad () {
      this.$log('nodesLoad start')
      let {items} = await this.$store.dispatch('lists/wsItems', {pagination: {pageSize: 30, pageToken: null}, sortStrategy: 'HOT', filter: {types: ['NODE']}})
      this.$log('nodesLoad done', items)
      return items
    },
    async nodesReload () {
      this.$log('nodesReload')
      this.nodes = await this.nodesLoad()
    }
  },
  async mounted () {
    this.$log('mounted')
    // TODO: initial load of items goes to kalpa-loader, and kalpa-loader is watching for updates...
    this.nodes = await this.nodesLoad()
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
