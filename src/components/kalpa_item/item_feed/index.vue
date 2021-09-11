<template lang="pug">
  div(:style=`{maxWidth: $q.screen.width + 'px'}`).row.full-width
    div(v-if="$store.state.ui.useDebug").row.full-width isActive:{{isActive}} isVisible:{{isVisible}}
    div(v-if="!reactiveItem || !reactiveItem.itemFull").row.full-width
      q-card(flat dark :style=`{width: $q.screen.width + 'px'}`)
        q-item
          q-item-section(avatar)
            q-skeleton(type='QAvatar' animation="fade" dark)
          q-item-section
            q-item-label
              q-skeleton(type='text' animation="fade" dark)
            q-item-label(caption='')
              q-skeleton(type='text' width='80%' animation="fade" dark)
        q-item
          //q-item-section(avatar).br
          q-item-section
            .row
              q-skeleton(height='350px' animation="none" dark bordered).col.q-mb-sm
              q-skeleton(v-if="item.type === 'JOINT'" height='350px' animation="none" dark bordered).col.q-mb-sm.q-ml-sm
            .row.text-grey.text-h5.items-center.content-center.justify-center.q-py-md
              span {{item.name || item.vertexType}}
            .row.items-center.justify-between.no-wrap
              .row.items-center
                q-icon.q-mr-sm(name='chat_bubble_outline' color='grey-4' size='18px')
                q-skeleton(type='text' width='30px' animation="fade" dark)
              .row.items-center
                q-icon.q-mr-sm(name='repeat' color='grey-4' size='18px')
                q-skeleton(type='text' width='30px' animation="fade" dark)
              .row.items-center
                q-icon.q-mr-sm(name='favorite_border' color='grey-4' size='18px')
                q-skeleton(type='text' width='30px' animation="fade" dark)

    div(v-else :style=`{position: 'relative'}`).row.full-width
      component(:is="componentName"  v-bind="$props" :block="reactiveItem.itemFull" :node="reactiveItem.itemFull")
      div(v-if="reactiveItem.itemFull.deletedAt").absolute.fit.dimmed.z-top
        span.absolute-center.text-white.text-h4 {{$t('unpublished')}}
</template>

<script>
import blockFeed from 'src/components/kalpa_item/item_feed/block_feed'
import nodeFeed from 'src/components/kalpa_item/item_feed/node_feed'
import joinFeed from 'src/components/kalpa_item/item_feed/joint_feed'
import { RxCollectionEnum } from 'src/system/rxdb'
import cloneDeep from 'lodash/cloneDeep'
import { ObjectTypeEnum } from 'src/system/common/enums'

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
      reactiveItem: this.item // item изначально не реактивен
    }
  },
  computed: {
    componentName () {
      switch (this.reactiveItem.type) {
        case ObjectTypeEnum.NODE: return 'node-feed'
        case ObjectTypeEnum.JOINT: return 'node-feed'
        case ObjectTypeEnum.BOOK: return 'block-feed'
        default: throw new Error('bad reactiveItem.type:' + this.reactiveItem.type)
      }
    }
  },
  watch: {
    // virtualScroll переиспользует оболочки и засовывает в них новые данные(этот экземпляр может использоватья для отображения разных ядер)
    // используем item для хранения состояния
    item: {
      immediate: true,
      deep: false,
      async handler (to, from) {
        this.reactiveItem = to
        if (this.isVisible) {
          // this.$log('item changed', to)
          this.getFullItem(to)
        }
      }
    },
    isVisible: {
      immediate: true,
      async handler (to, from) {
        if (to) {
          // this.$log('isVisible=true #', this.itemIndex, this.item.name, this.item.oid)
          this.getFullItem(this.item)
        } else {
          // this.$log('isVisible=false #', this.itemIndex, this.item.name, this.item.oid)
          this.cancelItemFull(this.item)
        }
      }
    }
  },
  methods: {
    getFullItem(item) {
      if (!item.itemFull && !item.queryId) {
        item.queryId = Date.now()
        // this.$log('get itemFull #', this.itemIndex, item.name, item.oid, cloneDeep(item))
        this.$rxdb.get(RxCollectionEnum.OBJ, item.oid, { queryId: item.queryId })
            .then(itemFull => {
              this.$set(item, 'itemFull', itemFull)
              item.queryId = null
            })
            .catch(err => {
              this.$logE('err on get itemFull', err)
              item.queryId = null
            })
      }
    },
    cancelItemFull(item) {
      if (item.queryId) {
        this.$rxdb.get(RxCollectionEnum.OBJ, this.item.oid, {queryId: item.queryId, cancel: true })
            .catch(err => this.$log('err on cancel request', err))
        // this.$log('cancel itemFull OK #', this.itemIndex, item.name, item.name)
      }
    }
  },
  created () {
    this.$set(this.item, 'itemFull', null)
    // this.$log('created', this.itemIndex, this.item)
  }
}
</script>
