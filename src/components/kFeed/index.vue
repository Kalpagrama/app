<template lang="pug">
div(style=`position: relative`).column.fit
  div(style=`position: relative`).col.scroll
    div(style=`position: relative`).row.full-width.justify-center
      div(:style=`{position: 'absolute', zIndex: 900, left: '0px', top: top+'px'}`
        ).row.full-width.justify-center
        node-card(v-if="node" :node="node" :index="0" :needFull="true").br
      apollo-query(:query="query" :variables="variables")
        template(v-slot="{ result: { loading, error, data } }")
          //- loading
          div(v-if="loading" style=`height: 100px`).row.full-width.items-center.justify-center
              q-spinner(size="50px" color="primary" :thickness="2")
          //- error
          div(v-else-if="error" style=`height: 100px`).row.full-width.items-center.justify-center
            span {{ error }} : (
          //- items
          template(v-else-if="data && data.feed")
            node-card(v-for="(n, ni) in data.feed.items" :key="n.oid" :index="ni" :node="n" :ref="'node_'+n.oid" :needFull="false" @visible="nodeVisible")
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
    }
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
      this.$log('nodevVisible', visible, index, node)
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
