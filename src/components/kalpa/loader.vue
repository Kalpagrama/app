<script>
export default {
  render () {
    return this.$scopedSlots.default({
      items: this.items // this.query ? this.query.items : []
    })
  },
  name: 'kalpaLoader',
  props: {
    type: {
      type: String,
      required: true
    },
    variables: {
      type: Object,
      default () {
        return {}
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
    variables: {
      deep: true,
      immediate: true,
      async handler (to, from) {
        this.$log('variables CHANGED', 'from=', from, ', to=', to)
        if (to) {
          this.itemsLoad(to)
        }
      }
    },
    items: {
      deep: false,
      immediate: false,
      handler(to, from){
        this.$log('items CHANGED', 'from=', from, ', to=', to)
      }
    }
  },
  methods: {
    async itemsMore () {
      try {
        this.$log('itemsMore start')
        // checks
        if (this.itemsCount >= this.totalCount) return
        this.itemsMoreLoading = true
        // TODO: do not mutate pageToken... in variables
        // сработает вотчер и запросит новые данные
        this.variables.pagination.pageToken = this.nextPageToken
        this.$log('itemsMore done')
        this.itemsMoreLoading = false
      } catch (e) {
        this.$log('itemsMore error', e)
        this.itemsMoreLoading = false
      }
    },
    async itemsLoad (variables, append = false) {
      // this.$log('itemsLoad start', variables)
      // get variables
      let { oid, pagination, filter, sortStrategy } = variables
      pagination = pagination || {pageSize: 30, pageToken: null}
      sortStrategy = sortStrategy || 'HOT'
      // get res
      let res
      let mangoQuery = {selector: {rxCollectionEnum: this.type}}
      let rxQuery
      switch (this.type) {
        case 'LST_SPHERE_NODES' :
        case 'LST_NODE_NODES' :
          mangoQuery.selector.oid = oid
          break
        case 'LST_FEED' :
        case 'WS_CONTENT' :
        case 'WS_NODE':
        case 'WS_SPHERE':
          break
        default: throw new Error(`Unknown kalpaLoader.type ${this.type}`)
      }
      let { items, count, totalCount, nextPageToken } = await this.$rxdb.find(mangoQuery)
      this.items = items
      this.nextPageToken = nextPageToken
      this.totalCount = totalCount
      this.itemsCount = items.length
    }
  }
}
</script>
