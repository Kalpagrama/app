<template lang="pug">
  div(
    v-if="!item.deletedAt"
    :style=`{maxWidth: $q.screen.width + 'px'}`).row.full-width
    div(v-if="!hasItemFull").row.full-width
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
              span {{item.name || this.$nodeItemType(item.vertexType || item.verices[0]).name}}
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
      component(:is="componentName"  v-bind="$props" :itemState="data" :block="item" :node="item")
</template>

// этот элемент показывается в virtual scroll и не может иметь состояния!!! data - запрещено! И во вложенных - тоже!!!
// virtualScroll переиспользует оболочки и засовывает в них новые данные(этот экземпляр может использоватья для отображения разных ядер)
// используем itemState для хранения состояния
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
    itemShortOrFull: { type: Object },
    itemState: { type: Object },
    itemIndex: { type: Number },
    nodeBackgroundColor: { type: String, default: 'rgb(30,30,30)' },
    nodeActionsColor: { type: String, default: 'rgb(200,200,200)' },
    isActive: { type: Boolean, default: false },
    isVisible: { type: Boolean, default: false },
    isPreload: { type: Boolean, default: false },
    scrolling: { type: Boolean, default: false },
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
  computed: {
    data () {
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      if (!this.itemState) this.itemState = {}
      let key = this.$options.name
      if (!this.itemState[key]) {
        // assert(this.itemState.id === this.itemShortOrFull.oid)
        this.$set(this.itemState, key, {
          oid: this.itemShortOrFull?.object?.oid || this.itemState.itemId,
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
          return 'node-feed'
        case ObjectTypeEnum.JOINT:
          return 'node-feed'
        case ObjectTypeEnum.BLOCK:
          return 'block-feed'
        default:
          throw new Error('bad this.item.type:' + this.item.type)
      }
    },
    hasItemFull () {
      // либо изначально прередали полный объект, либо запросили и уже получили
      return (this.itemShortOrFull.items || this.itemShortOrFull.graph) || this.data.itemFull
    },
    item () {
      return this.data.itemFull || this.itemShortOrFull
    }
  },
  watch: {
    hasItemFull: {
      immediate: false,
      async handler (to, from) {
        if (process.env.NODE_ENV === 'development') {
          // проверяем что во вложенных компонентах нет состояния (должны опираться только на props и itemState)
          if (to) {
            let checkChData = (parent) => {
              assert(parent.$options.name.startsWith('Q') || Object.keys(parent.$data).length === 0, 'component ' + parent.$options.name + ' has data!!!' + ' data - запрещено! И во вложенных - тоже!!!')
              for (let ch of parent.$children) {
                checkChData(ch)
              }
            }
            this.$nextTick(() => checkChData(this))
          }
        }
      }
    },
    isVisible: {
      immediate: true,
      async handler (to, from) {
        this.$log(`isVisible=${to} #${this.itemIndex}`)
        if (!this.hasItemFull) {
          if (to) this.getFullItem()
          else this.cancelItemFull()
        }
      }
    },
    isPreload: {
      immediate: true,
      async handler (to, from) {
        this.$log(`isPreload=${to} #${this.itemIndex}`)
        if (!this.hasItemFull) {
          if (to) this.getFullItemPreload()
          else this.cancelItemFullPreload()
        }
      }
    }
  },
  methods: {
    getFullItem () {
      let data = this.data // делаем копию тк за время выполнения this.data может поменяться (virtualScroll переиспользует оболочки и засовывает в них новые данные)
      assert(data && data.oid, data)
      if (!data.itemFull && !data.queryId) {
        data.queryId = Date.now()
        this.$rxdb.get(RxCollectionEnum.OBJ, data.oid, { queryId: data.queryId })
            .then(itemFull => this.$set(data, 'itemFull', itemFull))
            .catch(err => this.$logE('err on get itemFull', err))
            .finally(() => {
              data.queryId = null
            })
      }
    },
    cancelItemFull () {
      let data = this.data // делаем копию тк за время выполнения this.data может поменяться (virtualScroll переиспользует оболочки и засовывает в них новые данные)
      if (data.queryId) {
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
              if (itemFull) this.$set(data, 'itemFull', itemFull)
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
    // this.$log('created', this.itemIndex, this.itemState)
    assert((this.itemState || this.itemIndex == null) && this.itemShortOrFull, [this.itemIndex, this.itemState, this.itemShortOrFull])
    if (!this.data.itemFull && this.hasItemFull) this.data.itemFull = this.item
  },
  mounted () {
    // this.$log('mounted', this.itemIndex, this.itemState, this.isActive, this.isVisible)
  }
}
</script>
