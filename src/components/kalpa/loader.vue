<script>
export default {
  render () {
    return this.$scopedSlots.default({
      items: this.query ? this.query.items : []
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
        case 'CONTENT_NOTES_LIST' :
          res = await this.$store.dispatch('workspace/wsItems', 'CONTENT_NOTES_LIST')
          break
        case 'NODE_LIST' :
          res = await this.$store.dispatch('workspace/wsItems', 'NODE_LIST')
          break
        case 'SPHERE_LIST':
          res = await this.$store.dispatch('workspace/wsItems', 'SPHERE_LIST')
          break
        default: throw new Error(`Unknown kalpaLoader.type ${this.type}`)
      }
      // parse res
      let { items, count, totalCount, nextPageToken } = res
      // if (this.oid === oid && this.nextPageToken !== nextPageToken) {
      //   for (let item of items) this.nodes.push(item)
      // } else this.nodes = items
      // set shit
      this.query = res
      this.items = items
      this.nextPageToken = nextPageToken
      this.totalCount = totalCount
      this.itemsCount = items.length
      // this.$log('itemsLoad done')
    }
  }
}
</script>
