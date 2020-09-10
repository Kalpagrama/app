<script>
export default {
  render () {
    return this.$scopedSlots.default({
      items: this.itemsSliced,
      next: this.next,
    })
  },
  name: 'kalpaLoader',
  props: {
    sliceSize: {
      type: Number,
      default () {
        return 3
      }
    },
    mangoQuery: {
      type: Object,
      required: true,
    }
  },
  data () {
    return {
      items: [],
      itemsSlice: 1,
      itemsSliced: [],
      // itemsSlicing: false,
      itemsLoading: false,
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
      handler (to, from) {
        // this.$log('items TO', to)
        this.$emit('itemsCount', to.length)
        this.$emit('items', to)
        // alert('item CHANGED: ' + to.length)
        this.itemsSlice = 1
        this.itemsSliced = to.slice(0, this.sliceSize)
      }
    }
  },
  methods: {
    async next (index, done) {
      this.$log('next', index)
      // this.itemsSlicing = true
      // TODO: if we are in a bottom... what to do???
      // check
      if (this.itemsSlice > 1 && this.itemsSliced.length === this.items.length) {
        return
      }
      let start = this.itemsSliced.length
      let end = (this.itemsSlice + 1) * this.sliceSize
      this.$log('start/end', start, end)
      if (end > this.items.length) {
        end = this.items.length
      }
      let arr = this.items.slice(start, end)
      // this.$log('arr', arr)
      // set
      this.itemsSliced.splice(start, 0, ...arr)
      this.itemsSlice += 1
      // this.$q.notify('Loading... ' + this.itemsSlice)
      await this.$wait(1000)
      // this.itemsSlicing = false
      done()
    },
    async itemsLoad (mangoQuery, append = false) {
      // this.$log('itemsLoad start', mangoQuery)
      mangoQuery = mangoQuery || {selector: {}}
      try {
        let findRes = await this.$rxdb.find(mangoQuery)
        this.$log('this.$rxdb.find  items =  ', findRes)
        let { items, count, totalCount, nextPageToken } = findRes
        this.items = items
        this.itemsSliced = items.slice(0, this.sliceSize)
        this.$emit('items', items)
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
