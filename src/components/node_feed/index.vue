<template lang="pug">
div(:style=`{position: 'relative'}`).row.full-width
  template(v-if="feed && feed.items")
    node(:node="feed.items[indexNow]" :needFull="needFull" nodeFullReady
      :zIndex="1000"
      :style=`{position: 'absolute', zIndex: 1000, top: top+'px', maxHeight: '85vh', overflow: 'hidden !important'}`).bg-red-1
    node(
      v-for="(n, ni) in feed.items" :key="n.oid" :title="ni"
      :zIndex="200"
      :style=`{maxHeight: '85vh', overflow: 'hidden'}` :visible="ni === indexNow"
      :node="n" :needFull="ni >= indexFrom && ni < indexTo"
      v-observe-visibility=`{
        callback: nodeVisible,
        throttle: 330,
        intersection: {
          threshold: 0.7
        }
      }`).bg-white.q-mb-md
</template>

<script>
import node from 'components/node'

export default {
  name: 'node_feed',
  components: {node},
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
      needFull: true,
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
    async nodeVisible (isVisible, entry) {
      if (isVisible) {
        this.$log('nodeVisible YES', entry.target.title)
        let index = parseInt(entry.target.title)
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
        this.needFull = false
        await this.$wait(280)
        this.needFull = true
        this.opacity = 1
        this.top = entry.target.offsetTop
      } else {
        this.$log('nodeVisible NO')
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
