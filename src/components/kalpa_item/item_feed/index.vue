<template lang="pug">
  div(:style=`{maxWidth: $q.screen.width + 'px'}`).row.full-width
    div(v-if="$store.state.ui.useDebug").row.full-width isActive:{{isActive}} isVisible:{{isVisible}}
    div(v-if="!isItemFullReceived").row.full-width
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
      component(:is="componentName"  v-bind="$props" :block="item" :node="item")
      div(v-if="item.deletedAt").absolute.fit.dimmed.z-top
        span.absolute-center.text-white.text-h4 {{$t('unpublished')}}
</template>

<script>
import blockFeed from 'src/components/kalpa_item/item_feed/block_feed'
import nodeFeed from 'src/components/kalpa_item/item_feed/node_feed'
import joinFeed from 'src/components/kalpa_item/item_feed/joint_feed'
import { RxCollectionEnum } from 'src/system/rxdb'
import cloneDeep from 'lodash/cloneDeep'
import { ObjectTypeEnum } from 'src/system/common/enums'
import { assert } from 'src/system/common/utils'

export default {
  name: 'itemFeed',
  props: {
    itemFull: { type: Object },
    itemShort: { type: Object },
    itemIndex: { type: Number },
    nodeBackgroundColor: { type: String, default: 'rgb(30,30,30)' },
    nodeActionsColor: { type: String, default: 'rgb(200,200,200)' },
    isActive: { type: Boolean },
    isVisible: { type: Boolean },
    isPreload: { type: Boolean },
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
      reactiveItemShort: this.itemShort // itemShort изначально не реактивен
    }
  },
  computed: {
    componentName () {
      switch (this.item.type) {
        case ObjectTypeEnum.NODE:
          return 'node-feed'
        case ObjectTypeEnum.JOINT:
          return 'node-feed'
        case ObjectTypeEnum.BLOCK:
          return 'block-feed'
        default:
          throw new Error('bad reactiveItemShort.type:' + this.reactiveItemShort.type)
      }
    },
    isItemFullReceived () {
      return !!(this.itemFull || this.itemShort.itemFull)
    },
    item () {
      return this.itemFull || this.itemShort.itemFull || this.itemShort
    }
  },
  watch: {
    // virtualScroll переиспользует оболочки и засовывает в них новые данные(этот экземпляр может использоватья для отображения разных ядер)
    // используем itemShort для хранения состояния
    itemShort: {
      immediate: true,
      deep: false,
      async handler (to, from) {
        this.reactiveItemShort = to
        if (to && this.isVisible) {
          // this.$log('itemShort changed', to)
          this.getFullItem(to)
        }
      }
    },
    isVisible: {
      immediate: true,
      async handler (to, from) {
        if (this.itemShort) {
          if (to) {
            // this.$log('isVisible=true #', this.itemIndex, this.itemShort.name, this.itemShort.oid)
            this.getFullItem(this.itemShort)
          } else {
            // this.$log('isVisible=false #', this.itemIndex, this.itemShort.name, this.itemShort.oid)
            this.cancelItemFull(this.itemShort)
          }
        }
      }
    },
    isPreload: {
      immediate: true,
      async handler (to, from) {
        if (this.itemShort) {
          if (to) {
            // this.$log('isVisible=true #', this.itemIndex, this.itemShort.name, this.itemShort.oid)
            this.getFullItemPreload(this.itemShort)
          } else {
            // this.$log('isVisible=false #', this.itemIndex, this.itemShort.name, this.itemShort.oid)
            this.cancelItemFullPreload(this.itemShort)
          }
        }
      }
    }
  },
  methods: {
    getFullItem (itemShort) {
      assert(itemShort)
      if (!itemShort.itemFull && !itemShort.queryId) {
        itemShort.queryId = Date.now()
        // this.$log('get itemFull #', this.itemIndex, itemShort.name, itemShort.oid, cloneDeep(itemShort))
        this.$rxdb.get(RxCollectionEnum.OBJ, itemShort.oid, { queryId: itemShort.queryId })
            .then(itemFull => {
              this.$set(itemShort, 'itemFull', itemFull)
              itemShort.queryId = null
            })
            .catch(err => {
              this.$logE('err on get itemFull', err)
              itemShort.queryId = null
            })
      }
    },
    cancelItemFull (itemShort) {
      if (itemShort.queryId) {
        this.$rxdb.get(RxCollectionEnum.OBJ, this.item.oid, { queryId: itemShort.queryId, cancel: true })
            .catch(err => this.$log('err on cancel request', err))
        // this.$log('cancel itemFull OK #', this.itemIndex, itemShort.name, itemShort.name)
      }
    },
    getFullItemPreload (itemShort) {
      assert(itemShort)
      this.$log('preload start', this.itemIndex, this.itemShort.name)
      if (!itemShort.itemFull && !itemShort.queryId && !itemShort.queryIdPreload) {
        itemShort.queryIdPreload = Date.now()
        this.$rxdb.get(RxCollectionEnum.OBJ, itemShort.oid, { priority: 1, queryId: itemShort.queryIdPreload })
            .then(itemFull => {
              this.$log('preload ОК itemFull=', itemFull)
              if (itemFull) this.$set(itemShort, 'itemFull', itemFull)
              itemShort.queryIdPreload = null
            })
            .catch(err => {
              this.$logE('err on preload itemFull', err)
              itemShort.queryIdPreload = null
            })
      }
    },
    cancelItemFullPreload (itemShort) {
      if (itemShort.queryIdPreload) {
        this.$rxdb.get(RxCollectionEnum.OBJ, this.item.oid, { queryId: itemShort.queryIdPreload, cancel: true })
            .catch(err => this.$log('err on cancel preload request', err))
      }
    }
  },
  created () {
    if (this.itemShort) this.$set(this.itemShort, 'itemFull', null)
    // this.$log('created', this.itemIndex, this.item)
  }
}
</script>
