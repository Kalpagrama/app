<template lang="pug">
  div(v-if="!!item" :style=`{maxWidth: $q.screen.width + 'px'}`).row.full-width
    div(v-if="item.deletedAt" :style=`{position: 'absolute', zIndex: 1000, background: 'rgba(0,0,0, 0.8)'}`).row.fit.items-center.content-center.justify-center
      span.text-grey.text-h4.items-center.content-center.justify-center {{$t('unpublished')}}
    .row.full-width {{item.name}}
    .row.full-width {{reactiveItem.name}}
    .row.full-width {{reactiveItem.itemFull ? reactiveItem.itemFull.name:'---null---'}}
    block-feed(
      v-if="reactiveItem.type === 'BLOCK'"
      v-bind="$props"
      :block="reactiveItem.itemFull")
    node-feed(
      v-else-if="reactiveItem.type === 'NODE'"
      v-bind="$props"
      :node="reactiveItem.itemFull")
    node-feed(
      v-else-if="reactiveItem.type === 'JOINT'"
      v-bind="$props"
      :node="reactiveItem.itemFull")
</template>

<script>
import blockFeed from 'src/components/kalpa_item/item_feed/block_feed'
import nodeFeed from 'src/components/kalpa_item/item_feed/node_feed'
import joinFeed from 'src/components/kalpa_item/item_feed/joint_feed'
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'itemFeed',
  props: {
    item: { type: Object },
    itemIndex: { type: Number },
    nodeBackgroundColor: { type: String, default: 'rgb(30,30,30)' },
    nodeActionsColor: { type: String, default: 'rgb(200,200,200)' },
    isActive: { type: Boolean },
    isVisible: { type: Boolean },
    showHeader: { type: Boolean, default: true },
    showName: { type: Boolean, default: true },
    showAuthorAlways: { type: Boolean, default: false },
    showActions: { type: Boolean, default: true },
    showSpheres: { type: Boolean, default: true },
    showSpheresAlways: { type: Boolean, default: false },
    showCategory: { type: Boolean, default: true },
    showItems: { type: Boolean, default: true },
    orderHeader: { type: Number, default: -1 },
    orderName: { type: Number, default: 1 },
    orderSpheres: { type: Number, default: 2 },
    orderActions: { type: Number, default: 3 },
    itemsStyles: {
      type: Array,
      default () {
        return [{}, {}]
      }
    },
    styles: { type: Object },
    borderRadius: { type: String, default: '10px' },
    actionsColor: { type: String, default: 'grey-9' }
  },
  components: {
    blockFeed,
    nodeFeed,
    joinFeed
  },
  data () {
    return {
      reactiveItem: this.item
    }
  },
  watch: {
    item: { // virtualScroll переиспользует оболочки и засовывает в них новые данные(этот экземпляр может использоватья для отображения разных ядер)
      immediate: true,
      async handler (to, from) {
        this.reactiveItem = to
        if (this.isVisible && !to.itemFull) {
          this.$set(to, 'itemFull', await this.$rxdb.get(RxCollectionEnum.OBJ, to.oid))
        }
      }
    },
    isVisible: {
      immediate: true,
      async handler (to, from) {
        if (to) {
          this.$log('isVisible #', this.itemIndex, this.item.name, this.item.oid)
          let item = this.item // может поменяться во время await
          if (!item.itemFull) {
            this.$set(item, 'itemFull', await this.$rxdb.get(RxCollectionEnum.OBJ, item.oid))
          }
        } else {
          // this.$logW('cancel full node', this.name_, this.oid_)
          // await this.$rxdb.get(RxCollectionEnum.OBJ, this.item.oid, {cancel: true})
        }
      }
    }
  },
  created () {
    this.$set(this.item, 'itemFull', null)
    // this.$log('created', this.itemIndex, this.item)
  }
}
</script>
