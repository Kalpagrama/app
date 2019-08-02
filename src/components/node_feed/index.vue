<template lang="pug">
div(style=`position: relative`).row.full-width.items-start.content-start
  div(:style=`{position: 'absolute', zIndex: 1000, top: top+'px', opacity: opacity}`).row.full-width
    node-card(v-if="node" ref="anode" :node="node" :needFull="true" :zIndex="1000" :mini="false").bg-red-1
  div(v-if="feed && feed.items").row.full-width.items-start.content-start
    node-card(
      v-for="(n, ni) in feed.items" :key="n.oid" :ref="'node_'+n.oid"
      :node="n" :index="ni" :zIndex="200" :mini="true"
      :needFull="ni >= indexFrom && ni < indexTo"
      @visible="nodeVisible").q-mb-md
</template>

<script>
import nodeCard from 'components/node/node_card'

export default {
  name: 'node_feed',
  components: {nodeCard},
  props: {
    items: {type: Array},
    mini: {type: Boolean},
    queryKey: {type: String, default: 'feed'},
    query: {
      default () {
        return gql`
          query feed($pageToken: RawJSON) {
            feed(type: NEWS, pagination: {pageSize: 6, pageToken: $pageToken} filter: {types:[NODE]} ){
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
      opacity: 1,
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
      nodeShow: true,
      needFullAbsolute: true
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
          // this.$log('updateQuery from', from)
          // this.$log('updateQuery to', to)
          let res = {
            feed: {
              ...to.feed,
              items: [...from.feed.items, ...to.feed.items]
            }
          }
          // this.$log('updateQuery res', res)
          this.fetchingMore = false
          return res
        }
      })
    },
    async nodeVisible (visible, index, node, nodeFull) {
      let n = this.$refs['node_' + node.oid][0]
      if (visible) {
        this.$log('nodeVisible  TRUE', visible, index, node.name)
        this.indexNow = index
        if (index < 2) {
          this.indexFrom = 0
          this.indexTo = index + 3
        } else {
          this.indexFrom = index - 3
          this.indexTo = index + 3
        }
        // absolute node
        this.opacity = 0
        this.$set(this, 'node', node)
        this.$set(this, 'nodeFull', nodeFull)
        if (this.$refs.anode) this.$refs.anode.nodeLoad(node.oid)
        await this.$wait(200)
        this.top = n.$el.offsetTop
        this.opacity = 1
      } else {
        if (this.node && this.node.oid === node.oid) {
          this.$log('nodeVisible FALSE', visible, index, node.name)
        }
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
