<template lang="pug">
div(style=`position: relative`).row.full-width
  div(v-if="true" style=`position: fixed; zIndex: 1000; top: 0px; opacity: 0.85`).row.full-width.bg-green-1
    small.full-width needFull::{{needFull}}
    small.full-width pageToken::{{pageToken}}
    small.full-width counts{{itemsCount}}/{{totalCount}}
    small.full-width {{indexFrom}}/{{indexNow}}/{{indexTo}}
  //- div(v-if="node"
  //-   :style=`{position: 'absolute', zIndex: 900, left: '0px', top: top+'px', opacity: 1}`).row
  //-   node-card(:node="node" :needFull="true" :mini="mini").bg-red-1
  div(v-if="feed").row.full-width
    //- loading
    div(v-if="$apollo.queries.feed.loading").row.full-width Loading...
    //- items
    div(v-if="feed.items").row.full-width
      node-card(
        v-for="(n, ni) in feed.items" :key="n.oid" :ref="'node_'+n.oid"
        :node="n" :index="ni" :mini="mini"
        :needFull="ni >= indexFrom && ni < indexTo"
        :visible="node ? node.oid == n.oid : false"
        @visible="nodeVisible").q-mb-md
    //- fetching more
    div(v-if="fetchingMore" style=`height: 70px`).row.full-width.items-center.justify-center.bg-red
      q-spinner(size="50px" color="primary" :thickness="2")
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
    async nodeVisible (visible, index, node, nodeFull) {
      let n = this.$refs['node_' + node.oid][0]
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
        this.node = node
        this.nodeFull = nodeFull
        n.nodeStart()
        // TODO: await this.$wait(300)
        this.top = n.$el.offsetTop
      } else {
        if (this.node && node.oid === this.node.oid) {
          n.nodeStop()
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
