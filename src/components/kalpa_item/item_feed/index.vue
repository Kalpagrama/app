<template lang="pug">
  div(v-if="!!item" :style=`{maxWidth: $q.screen.width + 'px'}`).row.full-width
    div(v-if="item.deletedAt" :style=`{position: 'absolute', zIndex: 1000, background: 'rgba(0,0,0, 0.8)'}`).row.fit.items-center.content-center.justify-center
      span.text-grey.text-h4.items-center.content-center.justify-center {{$t('unpublished')}}
    block-feed(
      v-if="item.type === 'BLOCK'"
      v-bind="$props"
      :block="item")
    node-feed(
      v-else-if="item.type === 'NODE'"
      v-bind="$props"
      :node="item")
    node-feed(
      v-else-if="item.type === 'JOINT'"
      v-bind="$props"
      :node="item")
</template>

<script>
import blockFeed from 'src/components/kalpa_item/item_feed/block_feed'
import nodeFeed from 'src/components/kalpa_item/item_feed/node_feed'
import joinFeed from 'src/components/kalpa_item/item_feed/joint_feed'

export default {
  name: 'itemFeed',
  props: {
    item: {type: Object},
    nodeBackgroundColor: {type: String, default: 'rgb(30,30,30)'},
    nodeActionsColor: {type: String, default: 'rgb(200,200,200)'},
    isActive: {type: Boolean},
    isVisible: {type: Boolean},
    showHeader: {type: Boolean, default: true},
    showName: {type: Boolean, default: true},
    showAuthorAlways: {type: Boolean, default: false},
    showActions: {type: Boolean, default: true},
    showSpheres: {type: Boolean, default: true},
    showSpheresAlways: {type: Boolean, default: false},
    showCategory: {type: Boolean, default: true},
    showItems: {type: Boolean, default: true},
    orderHeader: {type: Number, default: -1},
    orderName: {type: Number, default: 1},
    orderSpheres: {type: Number, default: 2},
    orderActions: {type: Number, default: 3},
    itemsStyles: { type: Array, default () { return [{}, {}] } },
    styles: {type: Object},
    borderRadius: {type: String, default: '10px'},
    actionsColor: {type: String, default: 'grey-9'}
  },
  components: {
    blockFeed,
    nodeFeed,
    joinFeed
  },
  mounted () {
    this.$log('mounted', this.item)
  }
}
</script>
