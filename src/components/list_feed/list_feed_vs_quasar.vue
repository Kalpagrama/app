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
    ).row.q-pa-sm
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
            small.full-width scrollTargetIsWindow: {{ !this.scrollAreaHeight }}
            small.full-width scrollTargetHeight: {{ scrollTargetHeight }}
            small.full-width scrollHeight: {{ scrollHeight }}
            small.full-width scrolling: {{ scrolling }}
            small.full-width itemMiddleIndx: {{ itemMiddleIndx }}
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
      ref="vsHolder"
      :is="scrollAreaHeight ? 'q-scroll-area' : 'row-full-width-component'"
      :id="scrollId"
      :visible="false"
      :delay="1500"
      :style=`{height: scrollAreaHeight ? scrollAreaHeight + 'px' : null}`
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
      q-scroll-observer(:debounce="100" @scroll="onScrollObserver")
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
        ref="vs"
        :scroll-target="scrollAreaHeight ? `#${scrollId} > .scroll` : 'body'"
        dark
        :items="vsItems"
        :virtual-scroll-item-size="itemHeightApprox"
        :virtual-scroll-sticky-size-start="stickyHeaderHeight"
        @virtual-scroll="onScrollVS")
        template(v-slot:default=`{ item: {source: item, state}, index }`)
          //-item
          div(
            :ref="`item-${index}`"
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
          ).row.full-width
            div(
              :key="item[itemKey]"
              :accessKey="`${item[itemKey]}-${index}`"
              v-observe-visibility=`{
                throttle: 300,
                callback: itemMiddleHandler,
                intersection: {
                  root: null,
                  rootMargin: rootMargin,
                  //- threshold: 0.9,
                }
              }`
            ).row.full-width
              slot(
                name="item"
                :item="item"
                :itemState="state"
                :itemIndex="index"
                :isActive="itemActiveIndx === index"
                :isVisible="!!itemsVisibility[item[itemKey]]"
                :isPreload="index>=preloadInterval.from && index <= preloadInterval.to"
                :scrolling="scrolling"
              )
              span(v-if="$store.state.ui.useDebug" :style=`{color: itemActiveIndx === index ? 'green' : 'white'}`).absolute-top # {{index}} of {{length-1}} {{item[itemKey]}} {{!!itemsVisibility[item[itemKey]] ? '----VISIBLE' : ''}} {{item.name}}
              span(v-if="$store.state.ui.useDebug" :style=`{color: itemActiveIndx === index ? 'green' : 'white'}`).absolute-center.text-bold.text-h1.z-max {{index}}
</template>

<script>
import { scroll } from 'quasar'
import { assert } from 'src/system/common/utils'
import cloneDeep from 'lodash/cloneDeep'
import debounce from 'lodash/debounce'
import { RxCollectionEnum } from 'src/system/rxdb'

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
    itemActivePersist: { type: Boolean, default: false }
  },
  data () {
    return {
      itemsRes: null,
      vsItems: [],
      itemsVisibility: {},
      itemActiveIndx: null,
      itemMiddleIndx: null,
      stickyHeaderHeight: 0,
      preloadInterval: { from: -1, to: -1 },
      scrollHeight: 0,
      scrollTargetHeight: 0,
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
    rootMargin () {
      if (this.scrollHeight >= this.scrollTargetHeight) return '-50% 0px'
      else { // скролл не заполнен
        return `-${Math.ceil(50 * (this.scrollHeight / this.scrollTargetHeight))}% 0px`
      }
    },
    length () {
      return this.vsItems.length || 0
    },
    scrollId () {
      return 'scroll-area-with-virtual-scroll-uid-' + Date.now() + Math.random()
    },
    scrollTarget () {
      return getScrollTarget(this.$refs.vs.$el)
    },
    itemKey () {
      return this.itemsRes?.itemPrimaryKey
    }
  },
  watch: {
    'itemsRes.items': {
      async handler (to, from) {
        // this.$log('itemsRes.items changed', !!this.$refs.vs, to)
        this.resetItemsRes(this.itemsRes)
        this.$emit('count', to?.length || 0)
        this.$emit('items', this.vsItems.map(item => item.source))
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
      this.itemActiveIndx = null
      this.itemMiddleIndx = null
      this.preloadInterval = { from: -1, to: -1 }
      this.scrollHeight = 0
      this.itemsRes = itemsRes
      this.vsItems = this.vsItems = itemsRes?.items.map(item => {
        return {
          source: item.populatedObject || item,
          state: {
            itemId: item[this.itemKey]
          }
        }
      }) || []
      if (itemsRes) this.$log('resetItemsRes length=', this.length)
      if (this.$refs.vs) this.$refs.vs.refresh()
      // if (this.$refs.vs) this.$refs.vs.reset()
      if (itemsRes && this.itemActivePersist && itemsRes.getProperty('itemActiveIndx') != null && itemsRes.getProperty('itemActiveIndx') >= 0) {
        this.$nextTick(_ => {
          this.scrollTo(itemsRes.getProperty('itemActiveIndx'))
        })
      }
    },
    itemVisibilityHandler (isVisible, entry) {
      let [key, idxSting] = entry.target.accessKey.split('-')
      if (isVisible) this.$log('isVisible =', isVisible, idxSting, key)
      this.$set_deprecated(this.itemsVisibility, key, isVisible)
    },
    onItemClick (index) {
      this.itemActiveIndx = index
    },
    scrollTo (indx) {
      this.$log('scrollTo', indx)
      if (this.$refs.vs && this.length > indx && indx >= 0) this.$refs.vs.scrollTo(indx, 'start-force')
    },
    scrollToStart () {
      this.$log('scrollToStart')
      this.scrollTo(0)
    },
    scrollToEnd () {
      this.$log('scrollToEnd')
      this.scrollTo(Math.max(0, this.length - 1))
    },
    onScrollObserver (event) {
      this.$log('onScroll', {
        // ipos: event.inflexionPosition,
        pos: event.position,
        dir: `${event.direction === 'up' ? '↑' : '↓'} ${event.directionChanged ? '⇅' : ' '}`,
        velocity: this.prevScrollEvent ? (event.position - this.prevScrollEvent.event.position) / (Date.now() - this.prevScrollEvent.dt) : 0,
        sh: getScrollHeight(this.scrollTarget)
      })
      this.scrollHeight = this.$refs.vsHolder.$el.clientHeight
      if (this.prevScrollEvent && this.prevScrollEvent.sh !== getScrollHeight(this.scrollTarget)) {
        // изменился размер скролла(будет скачек из=за глюка виртуалскролла)
        // todo надо что-то сделать чтобы компенсировать скачек
        this.$log('scroll size changed!', this.itemMiddleIndx)
        // document.body.style.overflow = 'hidden'
        // this.$wait(1000).then(() => {
        //   document.body.style.overflow = ''
        // })
      }
      this.prevScrollEvent = { event, dt: Date.now(), sh: getScrollHeight(this.scrollTarget) }
    },
    onScrollVS (details) {
      this.$log('onScrollVS start', {
        itemActiveIndx: this.itemActiveIndx,
        // VS: details.ref.$el.clientHeight,
        // VS: this.$refs.vs.$el.clientHeight,
        // VSH: this.$refs.vsHolder.$el.clientHeight,
        sh: getScrollHeight(this.scrollTarget)
      })
      if (this.length) {
        this.itemActiveIndx = details.index
        if (details.direction === 'increase') { // мотаем вниз
          this.preloadInterval.from = this.itemActiveIndx
          this.preloadInterval.to = Math.min(this.length, this.itemActiveIndx + Math.ceil((this.scrollAreaHeight || this.$q.screen.height) * 2 / this.itemHeightApprox)) // + 2 экрана вниз
        } else {
          this.preloadInterval.from = Math.max(0, this.itemActiveIndx - Math.ceil((this.scrollAreaHeight || this.$q.screen.height) * 2 / this.itemHeightApprox)) // - 2 экрана вверх
          this.preloadInterval.to = this.itemActiveIndx
        }
        assert(this.preloadInterval.from <= this.preloadInterval.to, this.preloadInterval)
        // this.$log('onScrollVS', this.itemActiveIndx, this.preloadInterval, details.ref.$el.clientHeight, this.length)
        this.scrollHeight = details.ref.$el.clientHeight
        if (this.itemActivePersist) this.itemsRes.setProperty('itemActiveIndx', this.itemActiveIndx)
        // itemVisibilityHandler глючит Иногда не срабатывает. Минимизируем проблему.  itemActiveIndx - всегда видимо
        this.$set_deprecated(this.itemsVisibility, this.vsItems[this.itemActiveIndx][this.itemKey], true)
      }
    },
    scrollTargetResized () {
      this.scrollTargetHeight = this.scrollTarget === window ? this.scrollTarget.innerHeight : this.scrollTarget.clientHeight
    },
    itemMiddleHandler (isVisible, entry) {
      let [key, idxSting] = entry.target.accessKey.split('-')
      if (isVisible) {
        this.itemMiddleIndx = parseInt(idxSting)
        this.$log('itemMiddleHandler', isVisible, idxSting, key)
      }
    }
  },
  mounted () {
    this.$log('mounted', this.scrollAreaHeight, this.itemHeightApprox, this.scrollTarget)
    if (!this.scrollAreaHeight) assert(getScrollTarget(this.$el) === window, 'если не указана высота, то скролл умеет показываться только в window!!!')
    this.scrollTarget.addEventListener('resize', this.scrollTargetResized)
    this.scrollTargetResized() // начальное значение
  },
  beforeUnmount () {
    this.$log('beforeDestroy')
    this.scrollTarget.removeEventListener('resize', this.scrollTargetResized)
  }
}
</script>
