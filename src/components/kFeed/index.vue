<template lang="pug">
div(style=`position: relative`).column.fit
  div(style=`position: relative`).col.scroll
    div(style=`position: relative`).row.full-width.items-start.content-start.justify-center
      //- absolute node
      div(:style=`{position: 'absolute', zIndex: 900, left: '0px', top: top+'px'}`
        ).row.full-width.justify-center
        node-card(v-if="node" :node="node" :index="0" :needFull="true" :workspace="workspace"
          @nodeCreateFromNode="$event => $emit('nodeCreateFromNode', $event)" :mini="mini").bg-white
          template(v-slot:actions="{index, node, nodeFull}")
            slot(name="actions" :index="index" :node="node" :nodeFull="nodeFull")
          template(v-slot:footer="{index, node, nodeFull}")
            slot(name="footer" :index="index" :node="node" :nodeFull="nodeFull")
      //- items
      template(v-if="items").row.full-width.items-start.content-start
        node-card(v-for="(n, ni) in items" :key="n.oid" :index="ni" :node="n" :ref="'node_'+n.oid"
          :mini="mini"
          :needFull="false"
          :workspace="workspace"
          @visible="nodeVisible").bg-grey-1
      //- no items
      apollo-query(v-else :query="query" :variables="variables")
        template(v-slot="{ result: { loading, error, data } }")
          //- loading
          div(v-if="loading" style=`height: 100px`).row.full-width.items-center.justify-center
              q-spinner(size="50px" color="primary" :thickness="2")
          //- error
          div(v-else-if="error" style=`height: 100px`).row.full-width.items-center.justify-center
            span {{ error }} : (
          //- items
          template(v-else-if="data")
            node-card(v-for="(n, ni) in data[queryKey].items" :key="n.oid" :index="ni" :node="n" :ref="'node_'+n.oid"
              :mini="mini"
              :needFull="false"
              :workspace="workspace"
              @visible="nodeVisible").bg-grey-1
              template(v-slot:footer)
                slot(name="footer")
          //- nothing
          div(v-else style=`height: 100px;`).row.full-width.items-center.justify-center
            q-spinner(size="50px" :thickness="2" color="primary")
</template>

<script>
import nodeCard from 'components/node/node_card'

export default {
  name: 'kFeed',
  components: {nodeCard},
  props: {
    items: {type: Array},
    mini: {type: Boolean},
    queryKey: {type: String, default: 'feed'},
    query: {
      default () {
        return gql`
          query feed {
            feed(type: NEWS, pagination: {pageSize: 10, pageToken: null} filter: {types:[NODE]} ){
              count
              totalCount
              nextPageToken
              items {
                oid
                type
                thumbUrl (preferWidth: 600)
                createdAt
                name
              }
            }
          }
        `
      }
    },
    variables: {
      type: Object,
      default () {
        return {}
      }
    },
    workspace: {type: Boolean}
  },
  data () {
    return {
      top: 0,
      node: null,
      nodes: []
    }
  },
  methods: {
    nodeVisible (visible, index, node) {
      this.$log('nodeVisible', visible, index, node)
      if (visible) {
        this.node = node
        let n = this.$refs['node_' + node.oid]
        this.top = n[0].$el.offsetTop
        // this.$log('top', this.top)
      } else {
        // this.node = null
      }
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
