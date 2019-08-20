<template lang="pug">
div(:style=`{position: 'relative'}` body-scroll-lock-ignore).row.full-width
  q-resize-observer(@resize="onResize")
  div(v-if="false" :style=`{position: 'fixed', zIndex: 10000, top: '0px', width: width+'px', color: 'white'}`).row.bg-purple.q-pa-sm
    small.full-width activeNode: {{activeNode}} / visibleNodes: {{visibleNodes}} / itemsCount: {{itemsCount}}
    small.full-width fullNodes: {{fullNodes}}
  template(v-if="feed && feed.items")
    div(v-for="(n, ni) in feed.items" :key="n.oid").row.full-width.justify-center.items-start.content-start.q-pt-md
      node(
        :index="ni" :node="n" :lang="ni" :title="n.name"
        :zIndex="200" maxHeight="70vh"
        :needFull="ni >= fullNodes[0] && ni <= fullNodes[1]"
        :active="activeNode ? activeNode[0] === ni : false"
        :class=`{'bg-grey-3': activeNode ? activeNode[0] !== ni : false, 'bg-white': activeNode ? activeNode[0] === ni : false }`
        :style=`{maxWidth: '500px', borderRadius: '4px'}`
        v-observe-visibility=`{
          callback: nodeVisible,
          throttle: 300,
          intersection: {
            threshold: 0.5
          }
        }`
        ).q-mb-md
</template>

<script>
// import node from 'components/node'
import node from 'components/node/node_css'

export default {
  name: 'node_feed',
  components: {node},
  props: {
    items: {type: Array},
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
      width: 500,
      opacity: 0,
      node: null,
      nodeFull: null,
      needFull: true,
      pageToken: null,
      totalCount: 0,
      itemsCount: 0,
      visibleNodes: [],
      fetchingMore: false
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
    activeNode: {
      async handler (to, from) {
        if (to && to !== from && this.itemsCount - to[0] < 4) {
          if (!this.fetchingMore) {
            this.$log('activeNode CHANGED', to)
            this.fetchMore(this.q)
          }
        }
      }
    }
  },
  computed: {
    fullNodes () {
      if (this.activeNode) {
        let index = this.activeNode[0]
        let res = []
        if (index < 3) res = [0, index + 3]
        else res = [index - 3, index + 3]
        return res
      } else {
        return [0, 0]
      }
    },
    activeNode () {
      if (this.visibleNodes.length > 0) return this.visibleNodes[0]
      else return null
    }
  },
  methods: {
    onResize (e) {
      // this.$log('onResize width', e.width)
      this.width = e.width
    },
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
      let top = entry.target.offsetTop
      let name = entry.target.title
      let index = parseInt(entry.target.lang)
      if (isVisible) {
        this.$log('nodeVisible SHOW', index, name)
        this.visibleNodes.unshift([index, top])
      } else if (this.visibleNodes.find(([i, t]) => (i === index)) && this.visibleNodes.length > 1) {
        this.$log('nodeVisible HIDE', index, name)
        this.visibleNodes = this.visibleNodes.filter(([i, t]) => (i !== index))
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
