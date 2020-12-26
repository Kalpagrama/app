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
        // this.$logW('query CHANGED', to)
        if (this.items) {
          this.items = null
          this.itemsCreated = false
          this.next(0, () => {})
        }
      }
    },
    items: {
      deep: false,
      handler (to, from) {
        // this.$log('items UPDATED')
        if (to && from) {
          this.$log('items UPDATED', to.length)
          this.$emit('items', to)
        }
        // this.$log('items UPDATED', to)
        // this.$emit('items', to)
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
      this.$log('*** NEXT start ***')
      this.nexting = true
      if (!this.itemsCreated) {
        // this.$log('*** NEXT itemsCreating before', this.items)
        this.items = await this.$rxdb.find(this.query, false)
        this.itemsCreated = true
        // this.$log('*** NEXT itemsCreating next', this.items)
      }
      this.$log('before next. limit=', this.limit)
      await this.items.next(this.limit)
      this.$log('after next. hasMore=', this.items.hasMore)
      if (this.items.hasMore) done()
      else {
        this.$emit('items', this.items)
        done(true)
      }
      // this.$log('*** NEXT done ***')
      this.nexting = false
    }
  }
}
</script>
