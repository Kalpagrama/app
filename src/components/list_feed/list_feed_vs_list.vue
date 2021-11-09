<template lang="pug">
.row.full-width.items-start.content-start
  .row.full-width
    q-spinner-dots(v-if="!itemsRes" color="green" size="60px").absolute-center
    //- items
    div(:style=`{ position: 'relative'}`).row.full-width.items-start.content-start
      // header
      .row.full-width.q-pr-md
        slot(name="header")
      // sticky header
      div(:style=`{ position: 'sticky', top: '0px', zIndex: 100}`).row.full-width.q-pr-md
        q-resize-observer(@resize="stickyHeaderHeight = $event.height")
        slot(name="sticky-header")
        //div(:style=`{height: '50px', background: 'red'}`).row.full-width.bg
      // items list
      virtual-list(
        v-if="itemsRes"
        :style=`{maxHeight: scrollAreaHeight+'px', height: scrollAreaHeight+'px', overflowY: 'auto'}`
        :data-key="itemKey"
        :data-sources="itemsCopy"
        :estimate-size="itemHeightApprox"
        :page-mode="false"
      ).full-width
        template(v-slot:item=`{ item, index, scope }`)
          //item-component(:index="index", :source="item")
          slot(
            name="item"
            :item="item"
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
import VirtualList from 'vue-virtual-scroll-list'
import cloneDeep from 'lodash/cloneDeep'

const { getScrollTarget, getVerticalScrollPosition, setVerticalScrollPosition, getScrollHeight } = scroll

export default {
  name: 'listFeedVirtualScroll',
  components: { VirtualList },
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
    itemActivePersist: { type: Boolean, default: false }
  },
  data () {
    return {
      itemsRes: null,
      nonReactiveItems: [],
      itemsVisibility: {},
      itemMiddleIndx: null,
      stickyHeaderHeight: 0,
      preloadInterval: { from: -1, to: -1 }
    }
  },
  computed: {
    length () {
      return this?.itemsRes?.items?.length || 0
    },
    itemKey () {
      return this.itemsRes?.itemPrimaryKey
    },
    itemsCopy () {
      // this.$log('itemsCopy:', this.itemsRes.items.length)
      return Object.freeze(JSON.parse(JSON.stringify(this.itemsRes.items)))
    }
  },
  watch: {
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
            // this.$logW('scrollTo', this.itemsRes.getProperty('itemMiddleIndx'))
            this.$refs.vs.scrollTo(this.itemsRes.getProperty('itemMiddleIndx'), 'start-force')
          })
        }
      }
    }
  },
  methods: {
    itemsFn (from, size) {
      this.$logW('itemsFn:', from, size, this.itemsRes.items.length)
      assert(this.itemsRes)
      if (from >= this.itemsRes.items.length) return []
      let result = Object.freeze(cloneDeep((this.itemsRes.items.slice(from, from + size))))
      // for (let i of result) i.itemFull = null
      assert(result.length <= size)
      // this.$log('result=', result)
      return result
    },
    itemVisibilityHandler (isVisible, entry) {
      let [key, idxSting] = entry.target.accessKey.split('-')
      // if (isVisible) this.$log('isVisible =', isVisible, idxSting, key)
      this.$set(this.itemsVisibility, key, isVisible)
    },
    onScroll (details) {
      if (this.length) {
        this.itemMiddleIndx = details.index // Math.floor((details.from + details.to) / 2)
        if (details.direction === 'increase') { // мотаем вниз
          this.preloadInterval.from = this.itemMiddleIndx
          this.preloadInterval.to = Math.min(this.length, this.itemMiddleIndx + Math.ceil(this.scrollAreaHeight * 2 / this.itemHeightApprox)) // + 2 экрана вниз
          // this.preloadInterval.to = details.to
        } else {
          this.preloadInterval.from = Math.max(0, this.itemMiddleIndx - Math.ceil(this.scrollAreaHeight * 2 / this.itemHeightApprox)) // - 2 экрана вверх
          // this.preloadInterval.from = details.from
          this.preloadInterval.to = this.itemMiddleIndx
        }
        assert(this.preloadInterval.from <= this.preloadInterval.to)
        this.$log('scroll', this.itemMiddleIndx, this.preloadInterval)
        this.itemsRes.setProperty('itemMiddleIndx', this.itemMiddleIndx)
        // itemVisibilityHandler глючит Иногда не срабатывает. Минимизируем проблему.  itemMiddleIndx - всегда видимо
        this.$log('this.itemsVisibility this.itemMiddleIndx=', this.itemMiddleIndx, this.itemsRes.items.length)
        this.$set(this.itemsVisibility, this.itemsRes.items[this.itemMiddleIndx][this.itemKey], true)
      }
    }
  },
  mounted () {
    this.$log('mounted', this.scrollAreaHeight, this.$q.screen.height)
  },
  beforeUnmount () {
    this.$log('beforeDestroy')
  }
}
</script>
