<script>
export default {
  render () {
    return this.$scopedSlots.default({
      items: this.items,
      next: this.next,
      nexting: this.nexting
    })
  },
  name: 'kalpaLoader',
  props: {
    query: {
      type: Object,
      required: true
    },
    limit: {
      type: Number,
      default () {
        return 20
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
      items: null,
      itemsPage: 0,
      itemsPageToken: null,
      itemsTotal: 0,
      nexting: false
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
      this.next(0, () => {
      })
    },
    async next (i, done) {
      this.$log('next')
      this.nexting = true
      if (!this.items || !this.items.next) {
        // this.$log('next2')
        // this.query.populateObjects = true // ?????? ВСЕГДА запрашиваем полные сушности???
        this.items = await this.$rxdb.find(this.query, false)
      }
      // this.$log('next3')
      await this.$wait(500)
      // alert('next: ' + this.items.length + ' limit: ' + this.limit)
      let hasMore = await this.items.next(this.limit)
      if (hasMore) done()
      else done(true)
      // alert('next: ' + this.items.length + ' limit: ' + this.limit)
      // await this.$wait(1000)
      this.nexting = false
      // this.$log('next', i, this.items.length < this.itemsTotal)
      // if (this.itemsPage === 0 || this.items.length < this.itemsTotal) {
      //   this.$log('itemsGet LOADING MORE ITEMS...')
      //   this.itemsPage += 1
      //   let query = this.query
      //   query.limit = this.limit
      //   query.pageToken = this.itemsPageToken
      //   query.populateObjects = true
      //   this.$log('query', query)
      //   const items = await this.$rxdb.find(query)
      //   this.$log(items, count, totalCount, nextPageToken)
      //   this.itemsTotal = totalCount
      //   this.itemsPageToken = nextPageToken
      //   this.items = [...this.items, ...items]
      //   done()
      // }
      // else {
      //   this.$log('itemsGet NO MORE ITEMS...')
      //   done(true)
      // }
      this.$emit('next')
    }
  },
  async mounted () {
    this.$log('mounted')
    if (this.immediate) await this.next(0, () => {})
  }
}
</script>
