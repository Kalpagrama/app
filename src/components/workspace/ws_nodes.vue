<template lang="pug">
.row.fit
  div(:style=`{position: 'relative'}`).column.fit
    //- actions
    q-btn(
      round push size="lg" color="green" icon="add" @click="nodeAdd()"
      :style=`{position: 'absolute', right: '16px', bottom: '16px'}`)
    //- header with filters...
    .row.full-width.q-px-sm
      .col.full-height
      //- list, gallery, feed
      //- div(:style=`{width: '60px', height: '60px'}`
      //-   ).row.items-center.content-center.justify-center
      //-   q-btn(round flat color="green" icon="refresh" @click="nodesReload()")
      //- debug
      div(
        v-if="$store.state.ui.debug"
        :style=`{borderRadius: '10px', overflow: 'hidden'}`
        ).row.full-width.items-center.content-center.bg-green.q-pa-sm.q-my-sm
        small.text-white.full-width oid: {{ oid }}
    //- body
    //- TODO add scroll area from quasar...
    .col.full-width.scroll
      .row.full-width.items-start.content-start.q-px-sm
        kalpa-loader(type="wsNodes" :variables=`{}`)
          template(v-slot:items=`{items}`)
            ws-node(
              v-for="(n, ni) in items" :key="n.oid" @nodeClick="nodeClick"
              :oid="oid" :node="n")
</template>

<script>
import wsNode from './ws_node'

export default {
  name: 'wsNodes',
  components: {wsNode},
  props: ['oid'],
  data () {
    return {
      nodes: [],
      query: null
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
      let query = await this.$store.dispatch('lists/wsItems', {wsItemsType: 'NODES'})
      this.$log('nodesLoad done', query)
      this.query = query
    },
    async nodesReload () {
      this.$log('nodesReload')
      this.nodes = await this.nodesLoad()
    }
  },
  async mounted () {
    // this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
