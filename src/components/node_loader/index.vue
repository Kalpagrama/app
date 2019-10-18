<template lang="pug">
.row.full-width
  slot(v-if="kQuery" name="items" :items="kQuery.items" :fetchingMore="fetchingMore")
</template>

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
