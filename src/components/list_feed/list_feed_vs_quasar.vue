// если указан scrollAreaHeight - создаст virtualScroll в q-scroll-area, иначе - в getScrollTarget(this.$el)
<template lang="pug">
  div(:style=`{ position: 'relative'}`).row.full-width.items-start.content-start
    q-spinner-dots(v-if="!itemsRes" color="green" size="60px"
      :style=`{ position: scrollAreaHeight ? 'absolute' : 'fixed', top: '50%', left: 'calc(50% - 30px)'}`)
    // debug
    transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
      div(
        v-if="debugPosition && $store.state.ui.useDebug"
        :style=`{
        position: 'fixed', zIndex: 10000, top: debugPosition.top, right: debugPosition.right,
      }`
      ).row.q-pa-sm.br
        div(
          :style=`{
          position: 'absolute', zIndex: 10001, top: '0px', right: '46px',
          overflow: 'hidden',
        }`
        ).q-pa-sm
          transition(enter-active-class="animated slideInRight" leave-active-class="animated slideOutRight")
            div(
              v-if="itemsRes && debugOpened"
              :style=`{
              borderRadius: '10px',
              whiteSpace: 'nowrap'
            }`
            ).row.text-white.bg-green.q-pa-sm.bg
              small.full-width scrollTargetIsWindow: {{ scrollTargetIsWindow }}
              small.full-width scrollHeight: {{ scrollHeight }}
              small.full-width scrolling: {{ scrolling }}
        //- default
        div(
          v-if="itemsRes"
          :style=`{width: '36px', borderRadius: '10px',}`).row.b-40
          q-btn(
            @click="debugOpened = !debugOpened"
            :icon="debugOpened ? 'keyboard_arrow_right' : 'keyboard_arrow_left'"
            round flat dense color="white" ).full-width
            //- q-tooltip Дебаг вкл/выкл
          q-btn(
            @click="gotoStart"
            :color="itemsRes.hasPrev ? 'white' : 'red'"
            :disabled="!itemsRes.hasPrev"
            round flat dense icon="vertical_align_top").full-width
            //- q-tooltip В начало
          q-btn(
            @click="prev()"
            :loading="itemsResStatus === 'PREV'"
            :color="itemsRes.hasPrev ? 'white' : 'red'"
            :disabled="!itemsRes.hasPrev"
            round flat dense  icon="north").full-width
            //- q-tooltip Назад
          q-btn(
            @click="itemMiddleScrollIntoView('BTN')"
            round flat dense color="white" icon="adjust").full-width
          q-btn(
            @click="gotoCurrent"
            round flat dense color="white").full-width
            q-icon(name="flip").rotate-270
            //- q-tooltip Начать с текущего
          q-btn(
            @click="next()"
            :loading="itemsResStatus === 'NEXT'"
            :color="itemsRes.hasNext ? 'white' : 'red'"
            :disabled="!itemsRes.hasNext"
            round flat dense  icon="south").full-width
            //- q-tooltip Вперед
    //- items
    .row.full-width.items-start.content-start
      // если указана scrollAreaHeight, то скролл будет в q-scroll-area с указанной высотой
      component(
        :is="scrollAreaHeight ? 'q-scroll-area' : 'row-full-width-component'"
        :id="scrollId"
        :visible="false"
        :delay="1500"
        :style=`scrollAreaHeight ? {height: scrollAreaHeight + 'px'} : {}`
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
      ).full-width
        q-scroll-observer(:debounce="100" @scroll="onScroll")
        // headers + items
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
          :scroll-target="scrollTarget"
          dark
          :items="vsItems"
          :virtual-scroll-item-size="itemHeightApprox"
          :virtual-scroll-sticky-size-start="stickyHeaderHeight"
          @virtual-scroll="onScrollVS")
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
              :style=`{
                        // height: Math.min($store.state.ui.pageWidth, $q.screen.height) + 'px',
                        // overflow: 'hide',
                        position: 'relative'}`
              @click="onItemClick(index)"
            ).row.full-width.br
              slot(
                name="item"
                :item="item"
                :itemState="state"
                :itemIndex="index"
                :isActive="itemMiddleIndx === index"
                :isVisible="!!itemsVisibility[item[itemKey]]"
                :isPreload="index>=preloadInterval.from && index <= preloadInterval.to"
                :scrolling="scrolling"
              )
              span(v-if="$store.state.ui.useDebug" :style=`{color: itemMiddleIndx === index ? 'green' : 'grey'}`).absolute-top # {{index}} of {{length-1}} {{item[itemKey]}} {{!!itemsVisibility[item[itemKey]] ? '----VISIBLE' : ''}} {{item.name}}
              span(v-if="$store.state.ui.useDebug" :style=`{color: itemMiddleIndx === index ? 'green' : 'grey'}`).absolute-center.text-bold.text-h1.z-max {{index}}
</template>

<script>
import { scroll } from 'quasar'
import { assert } from 'src/system/common/utils'
import cloneDeep from 'lodash/cloneDeep'
import debounce from 'lodash/debounce'

const { getScrollTarget, getScrollPosition, setScrollPosition, getScrollHeight } = scroll

let rowFullWidthComponent = {
  props: [],
  template: `
    <div class="full-width">
    <slot></slot>
    </div>
  `
}
export default {
  name: 'listFeedVirtualScroll',
  components: { rowFullWidthComponent },
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
      itemsVisibility: {},
      itemMiddleIndx: null,
      stickyHeaderHeight: 0,
      preloadInterval: { from: -1, to: -1 },
      scrollHeight: 0,
      scrolling: false,
      debugOpened: false
    }
  },
  computed: {
    debugPosition () {
      return {
        top: 40 + '%',
        right: 0 + 'px'
      }
    },
    length () {
      return this.vsItems.length || 0
    },
    scrollId () {
      return 'scroll-area-with-virtual-scroll-uid-' + Date.now() + Math.random()
    },
    scrollTarget () {
      return this.scrollAreaHeight ? `#${this.scrollId} > .scroll` : getScrollTarget(this.$el)
    },
    scrollTargetIsWindow () {
      return this.scrollTarget === window
    },
    itemKey () {
      return this.itemsRes?.itemPrimaryKey
    }
  },
  watch: {
    'itemsRes.items': {
      async handler (to, from) {
        this.$log('itemsRes.items changed', !!this.$refs.vs, to?.length)
        this.resetItemsRes(this.itemsRes)
        this.$emit('count', to?.length || 0)
      }
    },
    query: {
      immediate: true,
      async handler (to, from) {
        this.resetItemsRes(null)
        this.resetItemsRes(await this.$rxdb.find(to, 100500, 100500 * 10))
      }
    }
  },
  methods: {
    resetItemsRes (itemsRes) {
      this.itemsVisibility = {}
      this.itemMiddleIndx = null
      this.preloadInterval = { from: -1, to: -1 }
      this.scrollHeight = 0
      this.itemsRes = itemsRes
      this.vsItems = this.vsItems = itemsRes?.items.map(item => {
        return {
          source: item,
          state: {
            itemId: item[this.itemKey],
            xxx: Math.random(),
            // элементов в списке может быть ОЧЕНЬ много (отрендеренный итем(их реально создается мало) вызывает onResize )
            onResize: (itemIndex, heightFrom, heightTo) => {
              // отрендеренный компонент поменял высоту
              // this.$log('onResize item', itemIndex, heightFrom, heightTo)
              if (heightFrom && itemIndex < this.itemMiddleIndx) {
                // элемент вверх изменил размер. Если ничего не делать - скролл будет дергаться
                let diff = heightTo - heightFrom
                if (diff) {
                  this.$log('onResize item', itemIndex, 'diff=', diff)
                  this.$log('getScrollPosition', getScrollPosition(this.scrollTarget))
                  // setScrollPosition(this.scrollTarget, getScrollPosition(this.scrollTarget) + diff)
                }
              }
            }
          }
        }
      }) || []
      if (itemsRes) this.$log('resetItemsRes length=', this.length)
      if (this.$refs.vs) this.$refs.vs.refresh()
      // if (this.$refs.vs) this.$refs.vs.reset()
      if (itemsRes && itemsRes.getProperty('itemMiddleIndx') != null && itemsRes.getProperty('itemMiddleIndx') >= 0) {
        this.$nextTick(_ => {
          this.scrollTo(itemsRes.getProperty('itemMiddleIndx'))
        })
      }
    },
    itemVisibilityHandler (isVisible, entry) {
      let [key, idxSting] = entry.target.accessKey.split('-')
      // if (isVisible) this.$log('isVisible =', isVisible, idxSting, key)
      this.$set(this.itemsVisibility, key, isVisible)
    },
    scrollTo (indx) {
      this.$log('scrollTo', indx)
      if (this.$refs.vs && this.length > indx && indx >= 0) this.$refs.vs.scrollTo(indx, 'start-force')
    },
    onScroll (event) {
      // this.$log('scroll', event)
      if (!this.debouncedScrollingClear) {
        this.debouncedScrollingClear = debounce(() => {
          this.scrolling = false
        }, 1000)
      }
      this.scrolling = true
      this.debouncedScrollingClear()
    },
    onScrollVS (details) {
      if (this.length) {
        this.itemMiddleIndx = details.index
        if (details.direction === 'increase') { // мотаем вниз
          this.preloadInterval.from = this.itemMiddleIndx
          this.preloadInterval.to = Math.min(this.length, this.itemMiddleIndx + Math.ceil((this.scrollAreaHeight || this.$q.screen.height) * 2 / this.itemHeightApprox)) // + 2 экрана вниз
        } else {
          this.preloadInterval.from = Math.max(0, this.itemMiddleIndx - Math.ceil((this.scrollAreaHeight || this.$q.screen.height) * 2 / this.itemHeightApprox)) // - 2 экрана вверх
          this.preloadInterval.to = this.itemMiddleIndx
        }
        assert(this.preloadInterval.from <= this.preloadInterval.to, this.preloadInterval)
        this.$log('scroll', this.itemMiddleIndx, this.preloadInterval, details.ref.$el.clientHeight, this.length)
        this.scrollHeight = details.ref.$el.clientHeight
        if (this.itemMiddlePersist) this.itemsRes.setProperty('itemMiddleIndx', this.itemMiddleIndx)
        // itemVisibilityHandler глючит Иногда не срабатывает. Минимизируем проблему.  itemMiddleIndx - всегда видимо
        this.$set(this.itemsVisibility, this.vsItems[this.itemMiddleIndx][this.itemKey], true)
      }
    },
    onItemClick (index) {
      this.itemMiddleIndx = index
    }
  },
  mounted () {
    this.$log('mounted', getScrollTarget(this.$el), this.scrollAreaHeight)
    if (!this.scrollAreaHeight) assert(getScrollTarget(this.$el) === window, 'если не указана высота, то скролл умеет показываться только в window!!!')
  }
}
</script>
