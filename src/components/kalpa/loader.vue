<script>
export default {
  render () {
    return this.$scopedSlots.default({
      items: this.itemsSliced,
      itemsMore: this.itemsMore,
    })
  },
  name: 'kalpaLoader',
  props: {
    sliceSize: {
      type: Number,
      default () {
        return 10
      }
    },
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
      itemsSlice: 1,
      itemsSliced: [],
      itemsSlicing: false,
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
        this.$log('loader items CHANGED', 'from=', from, ', to=', to)
        this.$emit('itemsCount', to.length)
      }
    }
  },
  methods: {
    async itemsMore () {
      this.$log('itemsMore')
      if (this.itemsSlicing) return
      this.itemsSlicing = true
      this.itemsSlice += 1
      this.$q.notify('Loading... ' + this.itemsSlice)
      let start = this.itemsSliced.length - 1
      let end = this.itemsSlice * this.sliceSize
      this.$log('start/end', start, end)
      let arr = this.items.slice(start, end)
      this.$log('arr', arr)
      this.itemsSliced.splice(start, 0, ...arr)
      await this.$wait(1000)
      this.itemsSlicing = false
    },
    async itemsLoad (mangoQuery, append = false) {
      // this.$log('itemsLoad start', mangoQuery)
      mangoQuery = mangoQuery || {selector: {}}
      try {
        let { items, count, totalCount, nextPageToken } = await this.$rxdb.find(mangoQuery)
        this.items = items
        this.itemsSliced = items.slice(0, this.sliceSize)
        this.nextPageToken = nextPageToken
        this.totalCount = totalCount
        this.itemsCount = items.length
        // this.$log('this.$rxdb.find = ', items)
      }
      catch (e) {
        this.$logE('itemsLoad error', e)
      }
    }
  }
}
</script>
