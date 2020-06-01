<script>
export default {
  render () {
    return this.$scopedSlots.default({
      items: this.items // this.query ? this.query.items : []
    })
  },
  name: 'kalpaLoader',
  props: {
    mangoQuery: {
      type: Object,
      default () {
        return null
      }
    }
  },
  data () {
    return {
      loaded: false,
      query: null,
      items: [],
      itemsLoading: false,
      itemsMoreLoading: false,
      pageToken: null,
      pageTokenNext: null,
      totalCount: 0,
      itemsCount: 0
    }
  },
  watch: {
    mangoQuery: {
      deep: true,
      immediate: true,
      async handler (to, from) {
        this.$log('mangoQuery CHANGED', 'from=', from, ', to=', to)
        if (to) {
          this.itemsLoad(to)
        }
      }
    },
    items: {
      deep: false,
      immediate: false,
      handler(to, from){
        // this.$log('items CHANGED', 'from=', from, ', to=', to)
        this.$emit('itemsCount', to.length)
      }
    }
  },
  methods: {
    async itemsMore () {
      // todo переделать variables на mangoQuery
      // try {
      //   this.$log('itemsMore start')
      //   // checks
      //   if (this.itemsCount >= this.totalCount) return
      //   this.itemsMoreLoading = true
      //   // TODO: do not mutate pageToken... in variables
      //   // сработает вотчер и запросит новые данные
      //   this.variables.pagination.pageToken = this.nextPageToken
      //   this.$log('itemsMore done')
      //   this.itemsMoreLoading = false
      // } catch (e) {
      //   this.$log('itemsMore error', e)
      //   this.itemsMoreLoading = false
      // }
    },
    async itemsLoad (mangoQuery, append = false) {
      // this.$log('itemsLoad start', mangoQuery)
      // get mangoQuery
      // let { oid, pagination, filter, sortStrategy } = mangoQuery
      // pagination = pagination || {pageSize: 30, pageToken: null}
      // sortStrategy = sortStrategy || 'HOT'
      // get res
      let res
      mangoQuery = mangoQuery || {selector: {}}
      let { items, count, totalCount, nextPageToken } = await this.$rxdb.find(mangoQuery)
      this.items = items
      this.nextPageToken = nextPageToken
      this.totalCount = totalCount
      this.itemsCount = items.length
    }
  }
}
</script>
