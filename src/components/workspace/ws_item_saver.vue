<script>
import { throttle } from 'quasar'
import { isRxDocument } from 'rxdb'
import assert from 'assert'
export default {
  render () {
    return this.$scopedSlots.default({
      item: this.item
    })
  },
  name: 'wsItemSaver',
  props: ['value'], // сваливается сверху
  data () {
    return {
      item: null, // то, что мы меняем
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
        assert(!isRxDocument(to), '!isRxDocument(to)')
        this.$log('value CHANGED', isRxDocument(to))
        if (from) this.externalUpdate = true
        this.item = to // JSON.parse(JSON.stringify(to))
      }
    },
    item: {
      deep: true,
      handler (to, from) {
        this.$log('item CHANGED to', this.externalUpdate, isRxDocument(this.item), from, to)
        this.$log('item CHANGED to', JSON.stringify(from) === JSON.stringify(to))
        // if (this.externalUpdate) {
        //   this.externalUpdate = false
        //   return
        // }
        // this.itemUpdate()
      }
    }
  },
  methods: {
    async itemUpdate () {
      try {
        this.$log(`itemUpdate start revision:${this.item.revision} item:` + JSON.stringify(this.item))
        if (isRxDocument(this.item)){
          this.$log('todo!!!', this.item)
          return
        }
        // if (this.itemUpdating) return
        // this.itemUpdating = true
        await this.$rxdb.upsertItem(this.item)
        // let item = await this.$store.dispatch('workspace/wsItemUpsert', this.item) // wsItemUpsert делает копию item
        this.$log('itemUpdate done:' + JSON.stringify(this.item))
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
