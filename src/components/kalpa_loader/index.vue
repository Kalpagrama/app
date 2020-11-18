<script>
import debounce from 'lodash/debounce'
// import { debounce } from 'quasar'

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
      nexting: false
    }
  },
  watch: {
    query: {
      deep: true,
      async handler (to, from) {
        this.$logW('query CHANGED', to, this.query)
        this.items = []
        this.nextDebounced(0, () => {})
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
    async next(i, done) {
      this.$log('next')
      this.nexting = true
      if (!this.items || !this.items.next) {
        this.items = await this.$rxdb.find(this.query, false)
      }
      let hasMore = await this.items.next(this.limit)
      if (hasMore) done()
      else done(true)
      this.nexting = false
      this.$emit('next')
    }
  },
  async mounted () {
    this.nextDebounced = debounce(this.next, 700, {leading: false})
    this.$log('mounted')
    if (this.immediate) await this.next(0, () => {})
  }
}
</script>
