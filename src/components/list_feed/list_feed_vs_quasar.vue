<template lang="pug">
  row.full-width.items-start.content-start
    .row.full-width
      q-spinner-dots(v-if="!itemsRes" color="green" size="60px").absolute-center
      //- items
      div(:style=`{ position: 'relative'}`).row.full-width.items-start.content-start
        q-scroll-area(
          :visible="false"
          :delay="1500"
          :style=`{
            maxHeight: $q.screen.height+'px',
            // если scrollAreaHeight не указана - занимаем всю высоту скролла (но не больше высоты экрана)
            height: (scrollAreaHeight || scrollHeight || 50) +'px'
            }`
          dark
          :thumb-style=`{
            right: '5px',
            zIndex: 100,
            borderRadius: '8px',
            backgroundColor: 'rgb(50,50,50)',
            width: '8px',
            opacity: 0.75}`
          :bar-style=`{
            right: '2px',
            borderRadius: '14px',
            backgroundColor: '#2222',
            width: '14px',
            opacity: 0.2,
            }`
          :id="scrollId"
        ).full-width
          // header
          .row.full-width
            slot(name="header")
          // sticky header
          div(:style=`{ position: 'sticky', top: '0px', zIndex: 100}`).row.full-width
            q-resize-observer(@resize="stickyHeaderHeight = $event.height")
            slot(name="sticky-header")
            //div(:style=`{height: '50px', background: 'red'}`).row.full-width.bg
          // items list
          q-virtual-scroll(
            v-if="itemsRes"
            ref="vs"
            :scroll-target="`#${scrollId} > .scroll`"
            dark
            :items="vsItems"
            :virtual-scroll-item-size="itemHeightApprox"
            :virtual-scroll-sticky-size-start="stickyHeaderHeight"
            @virtual-scroll="onScroll")
            template(v-slot:default=`{ item: {source: item, state}, index }`)
              //-item
              div(
                :accessKey="`${item[itemKey]}-${index}`"
                v-observe-visibility=`{
                  throttle: 300,
                  callback: itemVisibilityHandler,
                  intersection: {
                     threshold: 0.0,
                  },
                }`
                :style=`{border: itemMiddleIndx === index && $store.state.ui.useDebug ? '1px solid green' : ''}`
              ).row.full-width
                span(
                  v-if="$store.state.ui.useDebug" :dimmed="!!itemsVisibility[item[itemKey]]" :style=`{color: itemMiddleIndx === index ? 'green' : 'white'}`
                ) # {{index}} of {{vsItems.length-1}} {{item[itemKey]}} {{!!itemsVisibility[item[itemKey]] ? '----VISIBLE' : ''}} {{item.name}}
                slot(
                  name="item"
                  :item="item"
                  :itemState="state"
                  :itemIndex="index"
                  :isActive="itemMiddleIndx === index"
                  :isVisible="!!itemsVisibility[item[itemKey]]"
                  :isPreload="index>=preloadInterval.from && index <= preloadInterval.to"
                )
</template>

<script>
import { scroll } from 'quasar'
import { LstCollectionEnum, WsCollectionEnum } from 'src/system/rxdb/common'
import { assert } from 'src/system/common/utils'
import cloneDeep from 'lodash/cloneDeep'

const { getScrollTarget, getScrollPosition, setScrollPosition, getScrollHeight } = scroll

export default {
  name: 'listFeedVirtualScroll',
  props: {
    scrollAreaHeight: { // если не указано - то скролл - весь window (иначе скролл занимает отведенное место)
      type: Number,
      default: 300
    },
    query: {
      type: Object,
      required: true
    },
    itemHeightApprox: { // средний размер одного элемента
      type: Number,
      default: 100
    },
    itemMiddlePersist: { type: Boolean, default: false }
  },
  data () {
    return {
      itemsRes: null,
      vsItems: [],
      nonReactiveItems: [],
      itemsVisibility: {},
      itemMiddleIndx: null,
      stickyHeaderHeight: 0,
      preloadInterval: { from: -1, to: -1 },
      scrollHeight: 0
    }
  },
  computed: {
    scrollId () {
      return 'scroll-area-with-virtual-scroll-uid-' + Date.now() + Math.random()
    },
    itemKey () {
      return this.itemsRes?.itemPrimaryKey
    }
  },
  watch: {
    'itemsRes.items': {
      immediate: true,
      async handler (to, from) {
        this.$log('itemsRes.items', to?.length, to)
        this.vsItems = this?.itemsRes?.items.map(item => {
          return { source: item, state: {itemId: item[this.itemKey]} }
        }) || []
      }
    },
    query: {
      immediate: true,
      async handler (to, from) {
        this.itemsRes = await this.$rxdb.find(to, 100500, 100500 * 10)
        this.$log('this.itemsRes.items length=', this.itemsRes.items.length)
        if (from) {
          this.itemsRes.setProperty('itemMiddleIndx', null)
          this.$nextTick(_ => {
            this.$logE('refresh!!!', to)
            this.$refs.vs.refresh()
            this.$refs.vs.reset()
          })
        }
        if (this.itemsRes.getProperty('itemMiddleIndx') >= 0) {
          this.$nextTick(_ => {
            // this.$logW('scrollTo', this.itemsRes.getProperty('itemMiddleIndx'))
            this.$refs.vs.scrollTo(this.itemsRes.getProperty('itemMiddleIndx'), 'start-force')
          })
        }
      }
    }
  },
  methods: {
    itemVisibilityHandler (isVisible, entry) {
      let [key, idxSting] = entry.target.accessKey.split('-')
      // if (isVisible) this.$log('isVisible =', isVisible, idxSting, key)
      this.$set(this.itemsVisibility, key, isVisible)
    },
    onScroll (details) {
      if (this.vsItems.length) {
        this.itemMiddleIndx = details.index
        if (details.direction === 'increase') { // мотаем вниз
          this.preloadInterval.from = this.itemMiddleIndx
          this.preloadInterval.to = Math.min(this.vsItems.length, this.itemMiddleIndx + Math.ceil(this.scrollAreaHeight * 2 / this.itemHeightApprox)) // + 2 экрана вниз
        } else {
          this.preloadInterval.from = Math.max(0, this.itemMiddleIndx - Math.ceil(this.scrollAreaHeight * 2 / this.itemHeightApprox)) // - 2 экрана вверх
          this.preloadInterval.to = this.itemMiddleIndx
        }
        assert(this.preloadInterval.from <= this.preloadInterval.to, this.preloadInterval)
        this.$log('scroll', this.itemMiddleIndx, this.preloadInterval, details.ref.$el.clientHeight, this.vsItems.length)
        this.scrollHeight = details.ref.$el.clientHeight
        this.itemsRes.setProperty('itemMiddleIndx', this.itemMiddleIndx)
        // itemVisibilityHandler глючит Иногда не срабатывает. Минимизируем проблему.  itemMiddleIndx - всегда видимо
        this.$log('this.itemsVisibility this.itemMiddleIndx=', this.itemMiddleIndx, this.vsItems.length)
        this.$set(this.itemsVisibility, this.itemsRes.items[this.itemMiddleIndx][this.itemKey], true)
      }
    }
  },
  mounted () {
    this.$log('mounted', this.scrollAreaHeight, this.$q.screen.height)
  },
}
</script>
