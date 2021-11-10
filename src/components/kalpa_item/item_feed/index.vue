<template lang="pug">
div(
  v-if="!item.deletedAt"
  :style=`{maxWidth: $q.screen.width + 'px'}`).row.full-width
  div(v-if="!hasItemFull").row.full-width
    slot(name="skeleton")
      q-card(flat dark :style=`{width: $q.screen.width + 'px'}`)
        q-item
          q-item-section(avatar)
            q-skeleton(type='QAvatar' animation="none" dark :style=`{position: 'relative'}`).relative
          q-item-section
            q-item-label
              q-skeleton(type='text' :animation="data.queryId ? 'wave' : 'none'" dark)
            q-item-label(caption='')
              q-skeleton(type='text' width='80%' animation="none" dark)
        q-item.q-px-none
          q-item-section
            .row
              q-skeleton(:height="(Math.min($q.screen.width, $store.state.ui.pageWidth) / 2.2)+'px'" animation="none" dark bordered).col.q-mb-sm
              q-skeleton(v-if="item.type === 'JOINT'" :height="(Math.min($q.screen.width, $store.state.ui.pageWidth) / 2.2)+'px'" animation="none" dark bordered).col.q-mb-sm.q-ml-sm
            .row.text-grey.text-h5.items-center.content-center.justify-center.q-py-lg
              span {{item.name || (item.vertexType || item.verices ? $nodeItemType(item.vertexType || item.verices[0]).name : '')}}
            .row.items-center.justify-between.no-wrap.q-px-md
              .row.items-center
                q-icon.q-mr-sm(name='chat_bubble_outline' color='grey-4' size='18px')
                q-skeleton(type='text' width='30px' animation="none" dark)
              .row.items-center
                q-icon.q-mr-sm(name='repeat' color='grey-4' size='18px')
                q-skeleton(type='text' width='30px' animation="none" dark)
              .row.items-center.q-pb-md.q-pb-xl
                q-icon.q-mr-sm(name='favorite_border' color='grey-4' size='18px')
                q-skeleton(type='text' width='30px' animation="none" dark)

  div(v-else :style=`{position: 'relative'}`).row.full-width
    component(:is="componentName"  v-bind="$props" :itemState="data" :block="item" :node="item" :item="item")
</template>

// этот элемент показывается в virtual scroll и не может иметь состояния!!! data - запрещено! И во вложенных - тоже!!!
// virtualScroll переиспользует оболочки и засовывает в них новые данные(этот экземпляр может использоватья для отображения разных ядер)
// используем itemState для хранения состояния
<script>
import blockFeed from 'src/components/kalpa_item/item_feed/block_feed'
import nodeFeed from 'src/components/kalpa_item/item_feed/node_feed'
import nodeFeedTiny from 'src/components/kalpa_item/item_feed/node_feed/node_feed_tiny'
import anyFeedTiny from 'src/components/kalpa_item/item_feed/any_feed/any_feed_tiny'
import bookmarkListItem from 'src/components/bookmark/bookmark_list_item.vue'
import joinFeed from 'src/components/kalpa_item/item_feed/joint_feed'
import { RxCollectionEnum } from 'src/system/rxdb'
import cloneDeep from 'lodash/cloneDeep'
import { ObjectTypeEnum } from 'src/system/common/enums'
import { assert } from 'src/system/common/utils'

export default {
  name: 'itemFeed',
  props: {
    itemShortOrFull: { type: Object },
    itemState: {
      type: Object,
      default () {
        return {}
      }
    },
    itemIndex: { type: Number },
    nodeBackgroundColor: { type: String, default: 'rgb(30,30,30)' },
    nodeActionsColor: { type: String, default: 'rgb(200,200,200)' },
    isActive: { type: Boolean, default: false },
    isVisible: { type: Boolean, default: false },
    isPreload: { type: Boolean, default: false },
    scrolling: { type: Boolean, default: false },
    showHeader: { type: Boolean, default: true },
    showName: { type: Boolean, default: true },
    showAuthorAlways: { type: Boolean, default: true },
    showActions: { type: Boolean, default: true },
    showSpheres: { type: Boolean, default: true },
    showSpheresAlways: { type: Boolean, default: false },
    showCategory: { type: Boolean, default: true },
    showItems: { type: Boolean, default: true },
    showContext: { type: Boolean, default: true },
    showBadge: {type: Boolean, default: true},
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
    actionsColor: { type: String, default: 'grey-9' },
    height: { type: Number },
  },
  components: {
    blockFeed,
    nodeFeed,
    nodeFeedTiny,
    joinFeed,
    anyFeedTiny,
    bookmarkListItem
  },
  computed: {
    data () {
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      assert(this.itemState)
      let key = this.$options.name
      if (!this.itemState[key]) {
        // assert(this.itemState.id === this.itemShortOrFull.oid)
        this.$set_deprecated(this.itemState, key, {
          oid: this.itemShortOrFull?.oid || this.itemState.itemId,
          itemFull: null,
          queryId: null,
          queryIdPreload: null
        })
      }
      return this.itemState[key]
    },
    componentName () {
      switch (this.item.type) {
        case ObjectTypeEnum.NODE:
          return this.height < 300 ? 'node-feed-tiny' : 'node-feed'
        case ObjectTypeEnum.JOINT:
          return this.height < 300 ? 'node-feed-tiny' : 'node-feed'
        case ObjectTypeEnum.BLOCK:
          assert(!this.height, 'not impl')
          return 'block-feed'
        case ObjectTypeEnum.VIDEO:
        case ObjectTypeEnum.IMAGE:
        case ObjectTypeEnum.BOOK:
          return 'bookmark-list-item'
        default:
          assert(this.height, 'not impl')
          return this.height < 300 ? 'any-feed-tiny' : ''
      }
    },
    hasItemFull () {
      // либо изначально прередали полный объект, либо запросили и уже получили
      return (!!this.itemShortOrFull.items || !!this.itemShortOrFull.graph) || !!this.data.itemFull
    },
    item () {
      return this.data.itemFull || this.itemShortOrFull
    }
  },
  watch: {
    itemState: {
      handler (to, from) {
        // this.$log('itemState to', this.item.name, cloneDeep(from), cloneDeep(to), cloneDeep(this.itemState))
        if (!this.hasItemFull && (this.isVisible || this.isPreload)) this.getFullItem()
      }
    },
    hasItemFull: {
      immediate: false,
      async handler (to, from) {
        // this.$log('hasItemFull to', to)
        // if (process.env.NODE_ENV === 'development') {
        //   // проверяем что во вложенных компонентах нет состояния (должны опираться только на props и itemState)
        //   if (to) {
        //     // this.$log(`hasItemFull=${to} #${this.itemIndex}`)
        //     let checkChData = (parent) => {
        //       if (!parent) return
        //       assert(parent.$options.name.startsWith('Q') || Object.keys(parent.$data).length === 0, 'component ' + parent.$options.name + ' has data!!!' + ' data - запрещено! И во вложенных - тоже!!!')
        //       for (let ch of parent.$children) {
        //         checkChData(ch)
        //       }
        //     }
        //     this.$nextTick(() => checkChData(this))
        //   }
        // }
      }
    },
    isVisible: {
      immediate: true,
      async handler (to, from) {
        // if (to) this.$log(`isVisible=${to} #${this.itemIndex}`)
        if (!this.hasItemFull) {
          if (to) this.getFullItem()
          else this.cancelItemFull()
        }
      }
    },
    isPreload: {
      immediate: true,
      async handler (to, from) {
        // if (to) this.$log(`isPreload=${to} #${this.itemIndex}`)
        if (!this.hasItemFull) {
          if (to) this.getFullItemPreload()
          else this.cancelItemFullPreload()
        }
      }
    },
    itemShortOrFull(to) {
      // изменился показываемый item
      // this.$log('itemShortOrFull to', to, this.isActive)
      this.cancelItemFull()
      this.cancelItemFullPreload()
      // this.itemState = {} // нельзя модифицировать проперти
      for (let prop in this.itemState) delete this.itemState[prop]
    },
    isActive(to) {
      // this.$log('isActive to', to)
    }
  },
  methods: {
    getFullItem () {
      let data = this.data // делаем копию тк за время выполнения this.data может поменяться (virtualScroll переиспользует оболочки и засовывает в них новые данные)
      assert(data && data.oid, data)
      if (!data.itemFull && !data.queryId) {
        this.$log('getFullItem', this.itemIndex, this.item.name)
        data.queryId = Date.now()
        this.$rxdb.get(RxCollectionEnum.OBJ, data.oid, { queryId: data.queryId })
            .then(itemFull => this.$set_deprecated(data, 'itemFull', itemFull))
            .catch(err => this.$logE('err on get itemFull', err))
            .finally(() => {
              data.queryId = null
            })
      }
    },
    cancelItemFull () {
      let data = this.data // делаем копию тк за время выполнения this.data может поменяться (virtualScroll переиспользует оболочки и засовывает в них новые данные)
      if (data.queryId) {
        this.$log('cancelItemFull', this.itemIndex, this.item.name)
        this.$rxdb.get(RxCollectionEnum.OBJ, this.item.oid, { queryId: data.queryId, cancel: true })
            .catch(err => this.$log('err on cancel request', err))
            .finally(() => {
              data.queryId = null
            })
      }
    },
    getFullItemPreload () {
      let data = this.data // делаем копию тк за время выполнения this.data может поменяться (virtualScroll переиспользует оболочки и засовывает в них новые данные)
      assert(data && data.oid)
      if (!data.itemFull && !data.queryId && !data.queryIdPreload) {
        data.queryIdPreload = Date.now()
        this.$rxdb.get(RxCollectionEnum.OBJ, data.oid, { priority: 1, queryId: data.queryIdPreload })
            .then(itemFull => {
              if (itemFull) this.$set_deprecated(data, 'itemFull', itemFull)
            })
            .catch(err => this.$logE('err on preload itemFull', err))
            .finally(() => {
              data.queryIdPreload = null
            })
      }
    },
    cancelItemFullPreload () {
      let data = this.data // делаем копию тк за время выполнения this.data может поменяться (virtualScroll переиспользует оболочки и засовывает в них новые данные)
      if (data.queryIdPreload) {
        this.$rxdb.get(RxCollectionEnum.OBJ, this.item.oid, { queryId: data.queryIdPreload, cancel: true })
            .catch(err => this.$log('err on cancel preload request', err))
            .finally(() => {
              data.queryIdPreload = null
            })
      }
    }
  },
  created () {
    // this.$log('created', this.item.name)
    assert((this.itemState || this.itemIndex == null) && this.itemShortOrFull, [this.itemIndex, this.itemState, this.itemShortOrFull])
    if (!this.data.itemFull && this.hasItemFull) this.data.itemFull = this.item
  },
  mounted () {
    // this.$log('mounted', this.itemIndex, this.item.name)
  },
  beforeUnmount () {
    // this.$log('beforeDestroy', this.itemIndex, this.item.name)
    this.cancelItemFull()
    this.cancelItemFullPreload()
  },
  beforeUpdate () {
    // this.$log('beforeUpdate', this.itemIndex, this.item.name)
  }
}
</script>
