<script>
import debounce from 'lodash/debounce'
import assert from 'assert'

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
        return 12
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
      // inited: false,
      items: null,
      itemsCreated: false,
      nexting: false
    }
  },
  watch: {
    query: {
      deep: true,
      immediate: true,
      async handler (to, from) {
        this.$logW('query CHANGED', to)
        // if (!this.itemsCreated) {
        //   this.items = await this.$rxdb.find(this.query, false)
        //   this.itemsCreated = true
        // }
        if (this.items) {
          this.items = null
          this.itemsCreated = false
          this.next(0, () => {})
        }
        // if (!this.nextDebounced) {
        //   this.nextDebounced = debounce(this.next, 1000, {leading: true, maxWait: 1000}) // leading - срабатывает в начале
        // }
        // this.nextDebounced(0, () => {}, true)
      }
    },
    items: {
      deep: false,
      handler (to, from) {
        // this.$log('items UPDATED', to ? true : false, from ? true : false)
        // if (this.itemsCreated && to.next) {
        //   this.$emit('items', to)
        // }
        if (from) {
          this.$log('items UPDATED', to)
          this.$emit('items', to)
        }
      }
    },
    immediate: {
      immediate: true,
      handler (to, from) {
        if (to === true) {
          this.next(0, () => {})
        }
      }
    }
  },
  methods: {
    async next (i, done) {
      this.$log('*** NEXT ***')
      this.nexting = true
      if (!this.itemsCreated) {
        this.items = await this.$rxdb.find(this.query, false)
        this.itemsCreated = true
      }
      let hasMore = await this.items.next(this.limit)
      if (hasMore) done()
      else done(true)
      this.nexting = false
    }
    // async next(i, done, queryChanged = false) {
    //   this.$log('next')
    //   this.nexting = true
    //   if (!this.inited || queryChanged) {
    //     this.inited = true
    //     let items = await this.$rxdb.find(this.query, false)
    //     await items.next(this.limit)
    //     this.items = items
    //   }
    //   // else {}
    //   assert(this.items.next, '!this.items.next')
    //   let hasMore = await this.items.next(this.limit)
    //   if (hasMore) done()
    //   else done(true)
    //   this.nexting = false
    //   this.$emit('next')
    // }
  },
  // async created () {
  //   this.$log('created')
  //   // if (this.immediate) await this.next(0, () => {})
  // },
  // mounted () {
  //   this.$log('mounted')
  // }
}
</script>
