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
        // this.$log('mangoQuery CHANGED', 'from=', from, ', to=', to)
        if (to) {
          this.itemsLoad(to)
        }
      }
    },
    items: {
      deep: true,
      immediate: false,
      handler(to, from){
        // this.$log('loader items CHANGED', 'from=', from, ', to=', to)
        this.$emit('itemsCount', to.length)
        // alert('item CHANGED: ' + to.length)
        this.itemsSlice = 1
        this.itemsSliced = to.slice(0, this.sliceSize)
      }
    }
  },
  methods: {
    async itemsMore () {
      if (this.itemsSlicing) return
      this.$log('itemsMore')
      this.itemsSlicing = true
      // check
      let start = this.itemsSliced.length
      let end = (this.itemsSlice + 1) * this.sliceSize
      this.$log('start/end', start, end)
      if (end > this.items.length) end = this.items.length
      let arr = this.items.slice(start, end)
      this.$log('arr', arr)
      // set
      this.itemsSliced.splice(start, 0, ...arr)
      this.itemsSlice += 1
      // this.$q.notify('Loading... ' + this.itemsSlice)
      await this.$wait(1500)
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
