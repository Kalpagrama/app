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
      fetched: false,
      fetchingMore: false,
      pageToken: null,
      pageTokenNext: null,
      totalCount: 0,
      itemsCount: 0
    }
  },
  watch: {
    variables: {
      immediate: true,
      handler (to, from) {
        this.$log('VARIABLES CHANGED', to)
        if (to) this.nodesLoad(this.query, this.queryKey, to)
      }
    }
  },
  render () {
    this.$log('render')
    // this.$q.notify('RENDER')
    // slot(v-if="kQuery" name="items" :items="kQuery.items" :fetchingMore="fetchingMore")
    // await this.$wait(3000)
    // if (!this.fetched) this.nodesLoad(this.query, this.queryKey, this.variables)
    // this.fetched = true
    // this.$log('render variables', this.variables)
    if (this.$scopedSlots.default) {
      return this.$scopedSlots.default({
        // nodes: this.kQuery ? this.kQuery.items : [],
        nodes: this.nodes,
        fetchingMore: this.fetchingMore
      })
    } else {
      return null
    }
  },
  // apollo: {
  //     kQuery: {
  //       query () {
  //         return this.query
  //       },
  //       variables () {
  //         return this.variables
  //       },
  //       result ({ data, loading, networkStatus }) {
  //         if (data) {
  //           this.$logD('feed result', data)
  //           this.pageToken = data[this.queryKey].nextPageToken
  //           this.totalCount = data[this.queryKey].totalCount
  //           this.itemsCount = data[this.queryKey].items.length
  //         }
  //       },
  //       update (data) {
  //         return data[this.queryKey]
  //       },
  //       fetchPolicy: 'cache-and-network'
  //     }
  // },
  methods: {
    async needFetchMore () {
      this.$logD('needFetchMore start')
      this.fetchingMore = true
      await this.$wait(3000)
      this.fetchingMore = false
      this.$logD('needFetchMore done')
    },
    fetchMore () {
      this.$logD('fetchMore start')
      this.pageTokenNext = this.pageToken
      this.fetchingMore = true
      if (this.itemsCount >= this.totalCount) return
      this.$apollo.queries.kQuery.fetchMore({
        variables: {
          pageToken: this.pageTokenNext
        },
        updateQuery: (from, {fetchMoreResult: to}) => {
          // this.$logD('updateQuery from', from)
          // this.$logD('updateQuery to', to)
          let res = {
            [this.queryKey]: {
              ...to[this.queryKey],
              items: [...from[this.queryKey].items, ...to[this.queryKey].items]
            }
          }
          // this.$logD('updateQuery res', res)
          this.$logD('fetchMore done')
          this.fetchingMore = false
          return res
        }
      })
    },
    async nodesLoad (query, queryKey, variables) {
      this.$logD('nodesLoad start')
      let {data} = await this.$apollo.query({
        query: query,
        variables: variables
      })
      this.nodes = data[this.queryKey].items
      this.pageToken = data[this.queryKey].nextPageToken
      this.totalCount = data[this.queryKey].totalCount
      this.itemsCount = data[this.queryKey].items.length
      this.$logD('nodesLoad done')
    },
    // возможно это ядро скоро понадобятся
    prefetch(oid){
      this.$logD('prefetch', oid)
      this.$store.dispatch('objects/get', { oid, fragmentName: 'nodeFragment', priority: 1 })
        .catch(err => {
          this.$logD('prefetch error', err)
        })
      this.$logD('prefetch ok!', oid)
    }
  },
  async mounted () {
    this.$logD('mounted', this.variables)
  },
  beforeDestroy () {
    this.$logD('beforeDestroy')
  }
}
</script>
