<script>
export default {
  render () {
    return this.$scopedSlots.default({
      items: this.items,
      next: this.next,
    })
  },
  name: 'kalpaLoader',
  props: {
    query: {
      type: Object,
      required: true,
    },
    limit: {
      type: Number,
      default () {
        return 10
      }
    },
    immediate: {
      type: Boolean,
      default () {
        return false
      }
    }
  },
  data () {
    return {
      items: [],
      itemsPage: 0,
      itemsPageToken: null,
      itemsTotal: 0
    }
  },
  watch: {
    query: {
      deep: true,
      handler (to, from) {
        this.$log('query CHANGED', to)
        this.reset()
      }
    },
    items: {
      deep: true,
      handler (to, from) {
        this.$emit('items', to)
      }
    }
  },
  methods: {
    reset () {
      this.$log('reset')
      this.items = []
      this.itemsPage = 0
      this.itemsPageToken = null
      this.$emit('reset')
    },
    async next (i, done) {
      this.$log('next', i, this.items.length < this.itemsTotal)
      if (this.itemsPage === 0 || this.items.length < this.itemsTotal) {
        this.$log('itemsGet LOADING MORE ITEMS...')
        this.itemsPage += 1
        let query = this.query
        query.limit = this.limit
        query.pageToken = this.itemsPageToken
        // query.selector.populateObjects = true
        this.$log('query', query)
        const { items, count, totalCount, nextPageToken } = await this.$rxdb.find(query)
        this.$log(items, count, totalCount, nextPageToken)
        this.itemsTotal = totalCount
        this.itemsPageToken = nextPageToken
        this.items = [...this.items, ...items]
        done()
      }
      else {
        this.$log('itemsGet NO MORE ITEMS...')
        done(true)
      }
      this.$emit('next')
    }
  },
  mounted () {
    this.$log('mounted')
    if (this.immediate) this.next(0, () => {})
  }
}
</script>
