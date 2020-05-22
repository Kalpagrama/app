<script>
import { throttle } from 'quasar'
import assert from 'assert'

export default {
  render () {
    return this.$scopedSlots.default({
      item: this.item
    })
  },
  name: 'wsItemSaver',
  props: ['value'],
  data () {
    return {
      subscribed: false,
      item: null
    }
  },
  watch: {
    value: {
      deep: false,
      immediate: true,
      handler (to, from) {
        this.$log('value CHANGED', to)
        if (this.subscribed) return
        to.$.subscribe(this.valueChanged)
        this.subscribed = true
      }
    },
    item: {
      deep: true,
      handler (to, from) {
        this.$log('item CHANGED', to)
        this.itemUpdateThrottle()
      }
    }
  },
  methods: {
    valueChanged (change) {
      this.$log('valueChanged', change)
      this.item = change
    },
    async itemUpdate () {
      try {
        this.$log('itemUpdate start')
        await this.$rxdb.upsertItem(this.item)
        this.$log('itemUpdate done')
      } catch (e) {
        this.$logE('itemUpdate error', e)
      } finally {
      }
    }
  },
  created () {
    this.itemUpdateThrottle = throttle(this.itemUpdate, 1000)
  },
  async beforeDestroy () {
    await this.itemUpdate()
  }
}
</script>
