<template lang="pug">
  .row.full-width
    slot(name="default" :nodes="nodes")
</template>
<script>
export default {
  name: 'nodeLoader',
  props: {
    type: {type: String, required: true}, // feed or sphereNodes or nodeNodes
    variables: {type: Object}
  },
  watch: {
    variables: {
      immediate: true,
      async handler (to, from) {
        this.$logD('watch variables', 'from=', from, 'to=', to)
        if (to){
          await this.nodesLoad(to)
        }
      }
    }
  },
  data () {
    return {
      loaded: false,
      nodes: [],
      fetchingMore: false,
      pageToken: null,
      pageTokenNext: null,
      totalCount: 0,
      itemsCount: 0
    }
  },
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
      if (this.itemsCount >= this.totalCount) return
      this.variables.pagination.pageToken = this.nextPageToken // сработает вотчер и запросит новые данные
      this.fetchingMore = true
      this.$logD('fetchMore done')
    },
    async nodesLoad (variables, append = false) {
      this.$logD('nodesLoad start', variables)
      let { oid, pagination, filter, sortStrategy } = variables
      pagination = pagination || {pageSize: 100, pageToken: null}
      sortStrategy = sortStrategy || 'HOT'
      let res
      switch (this.type){
        case 'sphereNodes' :
          res = await this.$store.dispatch('lists/sphereNodes', { oid, pagination, filter, sortStrategy })
          break
        case 'feed' :
          res = await this.$store.dispatch('lists/feed', { oid, pagination, filter, sortStrategy })
          break
        case 'nodeNodes' :
          res = await this.$store.dispatch('lists/nodeNodes', { oid, pagination, filter, sortStrategy })
          break
        default: throw new Error(`unknown type ${this.type}`)
      }
      let { items, count, totalCount, nextPageToken } = res
      if (this.oid === oid && this.nextPageToken !== nextPageToken){
        for (let item of items) this.nodes.push(item)
      } else this.nodes = items
      this.nodes = items
      this.nextPageToken = nextPageToken
      this.totalCount = totalCount
      this.itemsCount = items.length
      this.$logD('nodesLoad2 done', this.nodes)
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
    // await this.nodesLoad(this.variables)
  },
  beforeDestroy () {
    this.$logD('beforeDestroy')
  }
}
</script>
