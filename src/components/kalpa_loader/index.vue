<script>
import debounce from 'lodash/debounce'
import {assert} from 'src/system/common/utils'

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
      findRes: null,
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
          this.findRes = null
          await this.next(0, () => {})
        }
      }
    },
    items: {
      deep: false,
      async handler (to, from) {
        this.$log('items UPDATED')
        // if (this.findRes && this.findRes.hasPrev){
        //   this.$logE('hasPrev!!! TODO нужно реализовать логику прокрутки вверх!!!!')
        //   await this.findRes.prev(10)
        // }
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
      if (!this.findRes) {
        // this.$log('*** NEXT itemsCreating before', this.items)
        this.findRes = await this.$rxdb.find(this.query) // {items, next, hasNext, prev, hasPrev}
        this.items = this.findRes.items
      } else {
        await this.findRes.next(this.limit)
      }
      if (this.findRes.hasNext) done()
      else {
        this.$emit('items', this.findRes.items)
        done(true)
      }
      this.nexting = false
    }
  }
}
</script>
