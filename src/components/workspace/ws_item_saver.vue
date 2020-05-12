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
      itemUpdating: false
    }
  },
  watch: {
    value: {
      deep: true,
      immediate: true,
      handler (to, from) {
        if (!to) return
        this.$log('value CHANGED', to.revision)
        this.item = JSON.parse(JSON.stringify(to))
      }
    },
    item: {
      deep: true,
      handler (to, from) {
        this.$log('item CHANGED to', to.revision)
        if (this.itemUpdating) return
        this.itemUpdate()
      }
    }
  },
  methods: {
    async itemUpdate () {
      try {
        this.$log('itemUpdate start revision: ', this.item.revision)
        if (this.itemUpdating) return
        this.itemUpdating = true
        // await this.$wait(1000)
        // if (this.item.rawData.name) this.item.name = this.item.rawData.name
        let item = await this.$store.dispatch('workspace/wsItemUpdate', JSON.parse(JSON.stringify(this.item)))
        this.$log('itemUpdate done revision:', item.revision)
      } catch (e) {
        this.$logE('itemUpdate error', e)
      } finally {
        this.itemUpdating = false
      }
    }
  },
  created () {
    this.itemUpdate = throttle(this.itemUpdate, 1000)
  }
}
</script>
