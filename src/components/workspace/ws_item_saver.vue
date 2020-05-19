<script>
import { throttle } from 'quasar'

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
      item: null,
      itemUpdateAuthor: null,
      externalUpdate: false // если данные были изменены извне
    }
  },
  watch: {
    value: {
      deep: true,
      immediate: true,
      handler (to, from) {
        if (!to) return
        this.$log('value CHANGED', to.revision)
        if (from) this.externalUpdate = true
        this.item = JSON.parse(JSON.stringify(to))
      }
    },
    item: {
      deep: true,
      handler (to, from) {
        this.$log('item CHANGED to', to.revision, this.externalUpdate)
        if (this.externalUpdate) {
          this.externalUpdate = false
          return
        }
        this.itemUpdate()
      }
    }
  },
  methods: {
    async itemUpdate () {
      try {
        this.$log(`itemUpdate start revision:${this.item.revision} item:`, this.item)
        // if (this.itemUpdating) return
        // this.itemUpdating = true
        let item = await this.$store.dispatch('workspace/wsItemUpsert', this.item) // wsItemUpsert делает копию item
        this.$log('itemUpdate done revision:', item.revision)
      } catch (e) {
        this.$logE('itemUpdate error', e)
      } finally {
        // this.itemUpdating = false
      }
    }
  },
  created () {
    this.itemUpdate = throttle(this.itemUpdate, 1000)
  }
}
</script>
