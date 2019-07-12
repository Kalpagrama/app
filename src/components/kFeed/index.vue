<template lang="pug">
div(style=`position: relative`).row.full-width
  div(v-if="false" style=`position: absolute; zIndex: 1000; top: 0px; opacity: 0.85`).row.full-width.bg-green-1
    small.full-width needFull::{{needFull}}
    small.full-width pageToken::{{pageToken}}
    small.full-width counts{{itemsCount}}/{{totalCount}}
    small.full-width {{indexFrom}}/{{indexNow}}/{{indexTo}}
  div(v-if="node"
    :style=`{position: 'absolute', zIndex: 900, left: '0px', top: top+'px', height: '50px', opacity: 1}`).row
    //- :nodeFullReady="nodeFull"
    node-card(:node="node" :needFull="true" :mini="mini").bg-white
  div(v-if="feed").row.full-width
    //- loading
    div(v-if="$apollo.queries.feed.loading").row.full-width Loading...
    //- items
    div(v-if="feed.items").row.full-width
      node-card(
        v-for="(n, ni) in feed.items" :key="n.oid" :ref="'node_'+n.oid"
        :node="n" :index="ni" :mini="mini"
        :needFull="ni >= indexFrom && ni < indexTo"
        @visible="nodeVisible").q-mb-md
    //- fetching more
    div(v-if="fetchingMore" style=`height: 70px`).row.full-width.items-center.justify-center.bg-red
      q-spinner(size="50px" color="primary" :thickness="2")
  //- div(v-if="items.length === 0"
  //-   style=`height: 500px`
  //-   ).row.items-center.justify-center
  //- k-dummy(v-for="(n, ni) in 40" :key="n" :name="ni")
  //- div(style=`position: relative`).col.scroll
  //-   div(style=`position: relative`).row.full-width.items-start.content-start.justify-center
      //- absolute node
      //- div(v-if="true" :style=`{position: 'absolute', zIndex: 900, left: '0px', top: top+'px'}`
      //-   ).row.full-width.justify-center
      //-   node-card(v-if="node" :node="node" :nodeFullReady="nodeFull" :index="0" :needFull="needFull" :workspace="workspace"
      //-     @nodeCreateFromNode="$event => $emit('nodeCreateFromNode', $event)" :mini="mini").bg-red-1
      //-     template(v-slot:actions="{index, node, nodeFull}")
      //-       slot(name="actions" :index="index" :node="node" :nodeFull="nodeFull")
      //-     template(v-slot:footer="{index, node, nodeFull}")
      //-       slot(name="footer" :index="index" :node="node" :nodeFull="nodeFull")
      //- items
      //- template(v-if="items").row.full-width.items-start.content-start
      //-   node-card(v-for="(n, ni) in items" :key="n.oid" :index="ni" :node="n" :ref="'node_'+n.oid"
      //-     :mini="mini"
      //-     :needFull="ni >= indexFrom &&  ni < indexTo"
      //-     :workspace="workspace"
      //-     @visible="nodeVisible").bg-grey-1
      //- no items
  //- apollo-query(:query="query" :variables="getVariables" @result="queryResult" :update="queryUpdate")
  //-   template(v-slot="{ result: { loading, error, data }, query }")
  //-     //- loading
  //-     div(v-if="loading" style=`height: 100px`).row.full-width.items-center.justify-center
  //-       q-spinner(size="50px" color="primary" :thickness="2")
  //-     //- error
  //-     div(v-else-if="error" style=`height: 100px`).row.full-width.items-center.justify-center
  //-       span {{ error }} : (
  //-     //- items
  //-     template(v-else-if="data")
  //-       node-card(v-for="(n, ni) in data[queryKey].items" :key="n.oid" :index="ni" :node="n" :ref="'node_'+n.oid"
  //-         :mini="mini"
  //-         :needFull="ni >= indexFrom && ni < indexTo"
  //-         :workspace="workspace"
  //-         @visible="(...$event) => nodeVisible(...$event, query)").bg-white.q-mt-md
  //-         template(v-slot:footer)
  //-           slot(name="footer")
  //-       //- fetch more
  //-       div(v-if="fetchingMore" style=`height: 70px`).row.full-width.items-center.justify-center.bg-red
  //-         q-spinner(size="50px" color="primary" :thickness="2")
  //-     //- nothing
  //-     div(v-else style=`height: 100px;`).row.full-width.items-center.justify-center
  //-       q-spinner(size="50px" :thickness="2" color="primary")
</template>

<script>
import nodeCard from 'components/node/node_card'
import kDummy from 'components/kDummy'

export default {
  name: 'kFeed',
  components: {nodeCard, kDummy},
  props: {
    items: {type: Array},
    mini: {type: Boolean},
    queryKey: {type: String, default: 'feed'},
    query: {
      default () {
        return gql`
          query feed($pageToken: RawJSON) {
            feed(type: NEWS, pagination: {pageSize: 8, pageToken: $pageToken} filter: {types:[NODE]} ){
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
      nodeFull: null,
      needFull: false,
      indexFrom: 0,
      indexNow: 0,
      indexTo: 2,
      pageToken: null,
      pageTokenNext: null,
      totalCount: 0,
      itemsCount: 0,
      fetchingMore: false,
      nodeShow: true
    }
  },
  apollo: {
    feed: {
      query () {
        return this.query
      },
      variables () {
        return this.variables
      },
      result ({ data, loading, networkStatus }) {
        if (data) {
          this.$log('feed result', data)
          this.pageToken = data[this.queryKey].nextPageToken
          this.totalCount = data[this.queryKey].totalCount
          this.itemsCount = data[this.queryKey].items.length
        }
      },
      fetchPolicy: 'cache-and-network'
    }
  },
  computed: {
    getVariables () {
      if (this.variables) {
        return this.variables
      } else {
        return {}
      }
    }
  },
  watch: {
    indexNow: {
      handler (to, from) {
        this.$log('*** indexNow CHANGED', to)
        if (this.itemsCount - this.indexNow < 4) this.fetchMore(this.q)
      }
    }
  },
  methods: {
    fetchMore () {
      this.$log('fetchMore')
      this.pageTokenNext = this.pageToken
      this.fetchingMore = true
      this.$apollo.queries.feed.fetchMore({
        variables: {
          pageToken: this.pageTokenNext
        },
        updateQuery: (from, {fetchMoreResult: to}) => {
          this.$log('updateQuery from', from)
          this.$log('updateQuery to', to)
          let res = {
            feed: {
              ...to.feed,
              items: [...from.feed.items, ...to.feed.items]
            }
          }
          this.$log('updateQuery res', res)
          this.fetchingMore = false
          return res
        }
      })
    },
    async nodeSwitch () {
      this.nodeShow = false
      await this.$wait(300)
      this.nodeShow = true
    },
    async nodeVisible (visible, index, node, nodeFull) {
      if (visible) {
        this.$log('nodeVisible', visible, index, node.name)
        this.indexNow = index
        if (index < 2) {
          this.indexFrom = 0
          this.indexTo = index + 3
        } else {
          this.indexFrom = index - 3
          this.indexTo = index + 3
        }
        // absolute node
        // this.$set(this, 'node', node)
        // this.$set(this, 'nodeFull', nodeFull)
        this.node = node
        this.nodeFull = nodeFull
        // this.nodeSwitch()
        await this.$wait(240)
        let n = this.$refs['node_' + node.oid]
        this.top = n[0].$el.offsetTop
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
