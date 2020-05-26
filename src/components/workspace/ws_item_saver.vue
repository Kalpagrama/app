<script>
import { throttle } from 'quasar'
import assert from 'assert'
import { isRxDocument } from 'rxdb'

export default {
  render () {
    return this.$scopedSlots.default({
      item: this.item
    })
  },
  name: 'wsItemSaver',
  props: ['value'], // original item
  data () {
    return {
      item: null, // copy of original item
      rxDocSubscription: null,
    }
  },
  watch: {
    value: {
      deep: true,
      immediate: true,
      handler (to, from) {
        // this.$log('original CHANGED', to)
        // this.subscribeRx(to)
        this.item = to
      }
    },
    item: {
      deep: true,
      immediate: true,
      handler (to, from) {
        // this.$log('copy CHANGED', to)
        // if (!to) return
        // if (to.changedBy === 'USER') this.itemUpdateThrottle()
      }
    }
  },
  methods: {
    // subscribeRx(rxDoc){
    //   assert(isRxDocument(rxDoc), '!isRxDocument(rxDoc)')
    //   if (this.rxDocSubscription) return
    //   // this.$log('subscribe to rxDoc:', rxDoc)
    //   this.rxDocSubscription = rxDoc.$.subscribe(change => {
    //     this.$log('rxDoc changed', change)
    //     change.changedBy = 'SYSTEM'
    //     this.item = JSON.parse(JSON.stringify(change))
    //   })
    // },
    // unsubscribeRx(){
    //   if (!this.rxDocSubscription) return
    //   this.rxDocSubscription.unsubscribe()
    //   delete this.rxDocSubscription
    // },
    //
    // async itemUpdate () {
    //   try {
    //     this.$log('itemUpdate start')
    //     this.unsubscribeRx()
    //     await this.$rxdb.upsertItem(this.item)
    //     if (this.value) this.subscribeRx(this.value)
    //     this.$log('itemUpdate done')
    //   } catch (e) {
    //     this.$logE('itemUpdate error', e)
    //   }
    // }
  },
  created () {
    // this.itemUpdateThrottle = throttle(this.itemUpdate, 1000)
  },
  async beforeDestroy () {
    // await this.itemUpdate()
  }
}
</script>
