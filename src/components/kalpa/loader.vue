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
        this.$emit('itemsCount', to.length)
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
      let rxQuery
      switch (this.type) {
        case 'sphereNodes' :
          res = await this.$store.dispatch('lists/sphereNodes', { oid, pagination, filter, sortStrategy })
          break
        case 'feed' :
          res = await this.$store.dispatch('lists/feed', { oid, pagination, filter, sortStrategy })
          break
        case 'nodeNodes' :
          res = await this.$store.dispatch('lists/nodeNodes', { oid, pagination, filter, sortStrategy })
          break
        case 'WS_CONTENT' :
        case 'WS_NODE':
        case 'WS_SPHERE':
          this.$log('items find...')
          this.items = await this.$rxdb.findWs(this.type, variables)
          break
        default: throw new Error(`Unknown kalpaLoader.type ${this.type}`)
      }

      if (res) {
        let { items, count, totalCount, nextPageToken } = res
        this.query = res
        this.items = items
        this.nextPageToken = nextPageToken
        this.totalCount = totalCount
        this.itemsCount = items.length
      }
    }
  }
}
</script>
