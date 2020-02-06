<template lang="pug">
.row.fit
  div(:style=`{position: 'relative'}`).column.fit
    //- actions
    q-btn(
      round push size="lg" color="green" icon="add" @click="nodeAdd()"
      :style=`{position: 'absolute', right: '16px', bottom: '16px'}`)
    //- header with filters...
    .row.full-width
      .col.full-height
      //- list, gallery, feed
      div(:style=`{width: '60px', height: '60px'}`
        ).row.items-center.content-center.justify-center
        q-btn(round flat color="green" icon="refresh" @click="nodesReload()")
    //- body
    .col.full-width.scroll
      .row.full-width.items-start.content-start.q-px-md
        div(
          v-for="(n,ni) in nodesFiltered" :key="ni" @click="nodeClick(n, ni)"
          :class=`{'bg-grey-10': n.oid !== oid, 'bg-white': n.oid === oid}`
          :style=`{height: '60px', borderRadius: '10px'}`
          ).row.full-width.items-center.cursor-pointer.q-px-sm.q-mb-sm
          span(
            :class=`{
              'text-white': n.oid !== oid,
              'text-green': n.oid === oid,
              'text-bold': n.oid === oid}`
          ) {{ n.name }}
</template>

<script>
export default {
  name: 'wsNodes',
  props: ['oid'],
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
    nodeAdd () {
      this.$log('nodeAdd')
    },
    nodeClick (n, ni) {
      this.$log('nodeClick', n, ni)
      this.$emit('item', n)
    },
    async nodesLoad () {
      this.$log('nodesLoad start')
      let {items} = await this.$store.dispatch('lists/wsItems', {pagination: {pageSize: 30, pageToken: null}, sortStrategy: 'HOT', filter: {nameRegExp: '^(?!^CONTENT-.{11}=$|^SPHERE$)', types: ['NODE']}})
      this.$log('nodesLoad done', items)
      // return items.map(i => i.object)
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
