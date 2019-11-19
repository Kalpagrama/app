<script>
export default {
  name: 'nodeLoader',
  props: {
    query: {type: Object, required: true},
    queryKey: {type: String, required: true},
    variables: {type: Object}
  },
  data () {
    return {
      nodes: [],
      fetchingMore: false,
      pageToken: null,
      pageTokenNext: null,
      totalCount: 0,
      itemsCount: 0
    }
  },
  render() {
    // slot(v-if="kQuery" name="items" :items="kQuery.items" :fetchingMore="fetchingMore")
    if (this.$scopedSlots.default) {
      return this.$scopedSlots.default({
        items: this.kQuery ? this.kQuery.items : [],
        fetchingMore: this.fetchingMore
      })
    } else {
      return null
    }
  },
  apollo: {
      kQuery: {
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
        update (data) {
          return data[this.queryKey]
        },
        fetchPolicy: 'cache-and-network'
      }
  },
  methods: {
    async needFetchMore () {
      this.$log('needFetchMore start')
      this.fetchingMore = true
      await this.$wait(3000)
      this.fetchingMore = false
      this.$log('needFetchMore done')
    },
    fetchMore () {
      this.$log('fetchMore start')
      this.pageTokenNext = this.pageToken
      this.fetchingMore = true
      if (this.itemsCount >= this.totalCount) return
      this.$apollo.queries.kQuery.fetchMore({
        variables: {
          pageToken: this.pageTokenNext
        },
        updateQuery: (from, {fetchMoreResult: to}) => {
          // this.$log('updateQuery from', from)
          // this.$log('updateQuery to', to)
          let res = {
            [this.queryKey]: {
              ...to[this.queryKey],
              items: [...from[this.queryKey].items, ...to[this.queryKey].items]
            }
          }
          // this.$log('updateQuery res', res)
          this.$log('fetchMore done')
          this.fetchingMore = false
          return res
        }
      })
    },
    async nodesLoad (query, queryKey, variables) {
      this.$log('nodesLoad start')
      let {data} = await this.$apollo.query({
        query: query,
        variables: variables
      })
      this.nodes = data[this.queryKey].items
      this.pageToken = data[this.queryKey].nextPageToken
      this.totalCount = data[this.queryKey].totalCount
      this.itemsCount = data[this.queryKey].items.length
      this.$log('nodeLoad done')
    },
    // возможно это ядро скоро понадобятся
    prefetch(oid){
      this.$log('prefetch', oid)
      this.$store.dispatch('objects/get', { oid, fragmentName: 'nodeFragment', priority: 1 })
        .catch(err => {
          this.$log('prefetch error', err)
          // this.$store.dispatch('log/error', ['node_loader', 'error', err])
        })
      this.$log('prefetch ok!', oid)
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
