<template lang="pug">
  row.full-width.items-start.content-start
    .row.full-width
      q-spinner-dots(v-if="!itemsRes" color="green" size="60px").absolute-center
      //- items
      div( v-if="itemsRes" :style=`{ position: 'relative'}`).row.full-width.items-start.content-start
        q-scroll-area(
          :visible="false"
          :delay="1500"
          :style=`{maxHeight: scrollAreaHeight+'px', height: scrollAreaHeight+'px'}`
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
          id="scroll-area-with-virtual-scroll-1"
        ).full-width
          // header
          .row.full-width.q-px-md
            slot(name="header")
          // sticky header
          div(:style=`{ position: 'sticky', top: '0px', zIndex: 100}`).row.full-width
            q-resize-observer(@resize="stickyHeaderHeight = $event.height")
            slot(name="sticky-header").row.full-width.br
            //div(:style=`{height: '50px', background: 'red'}`).row.full-width.bg
          // items list
          q-virtual-scroll(
            ref="vs"
            scroll-target="#scroll-area-with-virtual-scroll-1 > .scroll"
            dark
            :items-fn="itemsFn"
            :items-size="length"
            :virtual-scroll-item-size="itemHeightApprox"
            :virtual-scroll-sticky-size-start="stickyHeaderHeight"
            @virtual-scroll="onScroll").q-pr-md
            template(v-slot:default=`{ item, index }`)
              //-item
              div(
                :accessKey="`${item[itemKey]}-${index}`"
                v-observe-visibility=`{
                  throttle: 300,
                  callback: itemVisibilityHandler,
                  intersection: {
                     threshold: 0.2,
                  },
                }`
                :style=`{border: itemMiddleIndx === index && $store.state.ui.useDebug ? '1px solid green' : ''}`
              ).row.full-width
                span(
                  v-if="$store.state.ui.useDebug" :dimmed="!!itemsVisibility[item[itemKey]]" :style=`{color: itemMiddleIndx === index ? 'green' : 'white'}`
                ) # {{index}} of {{length-1}} {{item[itemKey]}} {{!!itemsVisibility[item[itemKey]] ? '----VISIBLE' : ''}}
                slot(
                  name="item"
                  :item="item"
                  :itemIndex="index"
                  :isActive="false"
                  :isVisible="!!itemsVisibility[item[itemKey]]")
          // footer
          slot(name="footer")
          //div(:style=`{height: '50000px', background: 'red'}`).row.full-width.bg
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
    headerHeight: { // место для скрываемого заголовка
      type: Number,
      default: 0
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
      nonReactiveItems: [],
      itemsVisibility: {},
      itemMiddleIndx: null,
      stickyHeaderHeight: 0
    }
  },
  computed: {
    length () {
      return this.itemsRes ? this.itemsRes.items.length : 0
    },
    itemKey () {
      return this.itemsRes?.itemPrimaryKey
    }
  },
  watch: {
    length: {
      immediate: true,
      async handler (to, from) {
        this.$logE('length changed!!!', to)
      }
    },
    query: {
      immediate: true,
      async handler (to, from) {
        this.itemsRes = await this.$rxdb.find(to, 10500, 100500)
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
            this.$logW('scrollTo', this.itemsRes.getProperty('itemMiddleIndx'))
            this.$refs.vs.scrollTo(this.itemsRes.getProperty('itemMiddleIndx'), 'start-force')
          })
        }
      }
    }
  },
  methods: {
    itemsFn (from, size) {
      // this.$log('itemsFn:', from, size, this.itemsRes.items.length)
      assert(this.itemsRes)
      if (from >= this.itemsRes.items.length) return []
      let result = Object.freeze(cloneDeep((this.itemsRes.items.slice(from, from + size))))
      assert(result.length <= size)
      // this.$log('result=', result)
      return result
    },
    itemVisibilityHandler (isVisible, entry) {
      let [key, idxSting] = entry.target.accessKey.split('-')
      // if (isVisible) this.$log('itemVisibilityChanged', isVisible, idxSting, key)
      this.$set(this.itemsVisibility, key, isVisible)
    },
    onScroll (details) {
      this.itemMiddleIndx = details.index // Math.floor((details.from + details.to) / 2)
      this.$log('scroll', this.itemMiddleIndx, details)
      this.itemsRes.setProperty('itemMiddleIndx', this.itemMiddleIndx)
    }
  },
  mounted () {
    this.$log('mounted', this.scrollAreaHeight, this.$q.screen.height)
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
