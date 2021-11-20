// если указан scrollAreaWidth - сделает внутренний скролл - иначе - воспользуется скроллом window
<template lang="pug">
div(
  :style=`{height: scrollAreaHeight+'px', width: scrollAreaWidth ? scrollAreaWidth+'px' : null, maxWidth: scrollAreaWidth ? scrollAreaWidth+'px' : null }`
  :class=`{ scroll: !!scrollAreaWidth}`).row.full-width
  div(ref="scrolledArea").row.full-width.relative-position.no-wrap
    q-resize-observer(@resize="scrolledAreaResized")
    //- debug
    transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
      div(
        v-if="debugPosition && $store.state.ui.useDebug"
        :style=`{
        position: 'fixed', zIndex: 10000, top: debugPosition.top, right: debugPosition.right,
      }`
      ).row.q-pa-sm
        //- details
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
              small.full-width scrollTargetWidth: {{ scrollTargetWidth }}
              small.full-width scrollLeft: {{ scrollLeft }}
              small.full-width scrollRight: {{ scrollRight }}
              small.full-width scrolledAreaWidth: {{ scrolledAreaWidth }}
              small.full-width count: {{ length }}
              small(v-if="itemActive").full-width itemActive.left: {{ itemActive.left }}
              q-btn(
                @click="itemActiveGetPosition"
                outline dense no-caps align="lef" size="sm"
                color="purple"
              ).full-width.q-mb-xs itemActive position?
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
            @click="scrollToStart"
            :color="itemsRes.hasPrev ? 'white' : 'red'"
            :disabled="!itemsRes.hasPrev"
            round flat dense icon="vertical_align_top").full-width
            //- q-tooltip В начало
          q-btn(
            @click="itemActiveScrollIntoView('BTN')"
            round flat dense color="white" icon="adjust").full-width
          q-btn(
            @click="fill"
            round flat dense color="white").full-width
            q-icon(name="flip").rotate-270
            //- q-tooltip Начать с текущего
    //- spinner, no itemsRes
    q-spinner-dots(v-if="!itemsRes" color="green" size="60px" :style=`{left: 'calc(50% - 30px)', top: '60px'}`).absolute-top
    // items
    // коробка с итемом. ее размер меняется только тогда, когда скролл стоит
    div(v-for="({source: item, state}, itemIndex) in vsItems"
      :ref="`item-${itemIndex}`"
      :key="`item-${itemIndex}`"
      :accessKey="`${itemIndex}`"
      :data-id="`${itemIndex}`"
      v-intersection=`{
        handler: itemActiveHandler,
        cfg: {
          root: scrollTargetIsWindow ? null : scrollTarget,
          rootMargin: rootMargin,
          //- threshold: 0.9,
        }
      }`
      :style=`{
          position: 'relative',
          // maxHeight: state.currentHeight + 'px',
          // maxWidth: state.currentWidth + 'px',
          // minHeight: state.currentHeight + 'px',
          // minWidth: state.currentWidth + 'px',
          // overflow: 'hidden',
          }`
    )
      // болванка (должна быть минимальной. их создается очень(очень) много)
      div(v-if="state.isDummy"
        :style=`{
             border: '2px solid rgb(50,50,50)',
             borderRadius: '10px',
             height: itemHeightApprox + 'px',
             width: itemWidthApprox + 'px',
       }`).row
      // item
      div(
        v-else
        :style=`{...itemStyles}`
        :data-id="`${item[itemKey]}-${itemIndex}`"
        v-intersection=`{
          handler: $throttle(itemVisibilityHandler, 300, {leading: false}),
          cfg: {
             root: scrollTargetIsWindow ? null : scrollTarget,
             threshold: 0.2},
          }`
      ).row.full-width
        //q-resize-observer(@resize="itemResized(itemIndex, $event.height, $event.width)")
        slot(
          name="item"
          :item="item"
          :itemState="state"
          :itemIndex="itemIndex"
          :isActive="itemActive && itemActive.indx === itemIndex"
          :isVisible="!!itemsVisibility[item[itemKey]]",
          :isPreload="true",
          :scrolling="scrolling"
        )
      span(v-if="$store.state.ui.useDebug" :style=`{color: itemActive && itemIndex === itemActive.indx ? 'green' : 'grey'}`
      ).absolute-top # {{itemIndex}} of {{length}}
</template>

<script>
import { scroll } from 'quasar'
import { LstCollectionEnum, WsCollectionEnum } from 'src/system/rxdb/common'
import { assert } from 'src/system/common/utils'
import debounce from 'lodash/debounce'

const { getScrollTarget, getHorizontalScrollPosition, setHorizontalScrollPosition, getScrollWidth } = scroll
// import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock'

export default {
  name: 'listFeedCustomHorizontalPPV',
  props: {
    scrollAreaHeight: { // если не указано - то скролл будет подстраиватья под высоту элементов (todo)
      type: Number,
      default: 300
    },
    scrollAreaWidth: { // если не указано - то скролл - весь window (иначе скролл занимает отведенное место)
      type: Number,
      default: null
    },
    query: {
      type: Object,
      required: true
    },
    itemHeightApprox: { // средний размер одного элемента
      type: Number,
      default: 300
    },
    itemWidthApprox: { // средний размер одного элемента
      type: Number,
      default: 200
    },
    itemStyles: {
      type: Object,
      default () {
        return {}
      }
    },
    itemActivePersist: {
      type: Boolean,
      default () {
        return true
      }
    }
  },
  data () {
    return {
      // debug
      debugOpened: false,
      showHeader: false,
      stickyHeaderHeight: 0,
      // scrollTarget
      scrollTarget: null,
      scrollTargetWidth: 0,
      scrollLeft: 0, // расстояние от начала скроллируемого списка до первого видимого пикселя
      scrollRight: 0, // расстояние от конца скроллируемого списка до последнего видлимого пикселя
      scrolledAreaWidth: 0,
      scrolling: false,
      itemsRes: null,
      vsItems: [],
      // item
      itemActive: null,
      noDummyAreaCenterIndx: null,
      itemsVisibility: {}
    }
  },
  computed: {
    debugPosition () {
      if (!this.scrollTarget) return null
      if (this.scrollTargetIsWindow) {
        return {
          top: 40 + '%',
          right: 0 + 'px'
        }
      } else {
        return {
          top: 40 + '%',
          right: 0 + 'px'
        }
      }
    },
    rootMargin () {
      if (this.scrolledAreaWidth >= this.scrollTargetWidth) return '0px -50%'
      else { // скролл не заполнен
        return `0px -${Math.ceil(50 * (this.scrolledAreaWidth / this.scrollTargetWidth))}%`
      }
    },
    itemKey () {
      return this.itemsRes?.itemPrimaryKey
    },
    scrollTargetIsWindow () {
      return this.scrollTarget === window
    },
    length () {
      return this.vsItems.length
    }
  },
  watch: {
    query: {
      immediate: true,
      async handler (to, from) {
        this.$log('query', from)
        if (from) {
          this.itemActive = null
          this.noDummyAreaCenterIndx = null
          this.vsItems.splice(0, this.vsItems.length)
          this.itemsRes = null
        }
        this.itemsRes = await this.$rxdb.find(to, 100500, 100500 * 100500)
      }
    },
    'itemsRes.items': {
      async handler (to, from) {
        if (!to) return
        this.$log('itemsRes.items:', to.length, this.itemsRes.getProperty('itemActiveIndx'), this.noDummyAreaCenterIndx)
        this.vsItems = this.vsItems = this.itemsRes.items.map(item => {
          return {
            // debugInfo: item.debugInfo,
            source: item.populatedObject || item,
            state: {
              itemId: item[this.itemKey],
              isDummy: true,
              currentHeight: this.itemHeightApprox, // примененная высота
              currentWidth: this.itemWidthApprox, // примененная ширина
              actualHeight: this.itemHeightApprox, // применится после остановки скролла
              actualWidth: this.itemWidthApprox // применится после остановки скролла
            }
          }
        }) || []
        this.noDummyAreaCenterIndx = null
        this.$nextTick(() => {
          // this.$log('itemsRes.items $nextTick', this.itemActive, this.itemsRes.getProperty('itemActiveIndx'))
          this.noDummyAreaCenterIndx = this.itemActive ? this.itemActive.indx : 0
          if (this.itemActivePersist && !this.itemActive) {
            let ref = this.$refs[`item-${this.itemsRes.getProperty('itemActiveIndx')}`]
            if (ref) {
              ref.scrollIntoView(false)
              this.$nextTick(() => {
                let itemLeftOffset = this.scrollTargetWidth / 2 - ref.clientWidth / 2
                this.$log('itemLeftOffset=', itemLeftOffset)
                setHorizontalScrollPosition(this.scrollTarget, getHorizontalScrollPosition(this.scrollTarget) - itemLeftOffset) // перемещаем элемент в центр видимой области
              })
            }
          }
        })
        this.$emit('count', to.length)
        this.$emit('items', this.vsItems.map(item => item.source))
      }
    },
    noDummyAreaCenterIndx: {
      async handler (to, from) {
        this.$log('noDummyAreaCenterIndx changed: ', to)
        const itemPerScreenCnt = Math.ceil(this.scrollTargetWidth / this.itemWidthApprox)
        // this.$log(`itemActive.indx: ${from}->${to} itemPerScreenCnt=${itemPerScreenCnt}`, this.vsItems)
        for (let indx = 0; indx < this.length; indx++) {
          // "isDummy = true" делается на большем расстоянии чтобы не было рекурсивного зацикливания (смена isDummy может привести к смене itemActive из-за изменения высоты элемента)
          if (indx < to - itemPerScreenCnt * 5 || indx > to + itemPerScreenCnt * 5) this.vsItems[indx].state.isDummy = true
          if (indx >= to - itemPerScreenCnt * 3 && indx <= to + itemPerScreenCnt * 3) this.vsItems[indx].state.isDummy = false
        }
      }
    },
    scrolling: {
      async handler (to, from) {
        // // скролл остановился. применим к загруженным итемам актуальную высоту
        // if (!to) {
        //   this.$log('scroll stop', this.length)
        //   let widthChanged = false
        //   for (let indx = 0; indx < this.length; indx++) {
        //     if (this.vsItems[indx].state.currentWidth !== this.vsItems[indx].state.actualWidth || this.vsItems[indx].state.currentHeight !== this.vsItems[indx].state.actualHeight) {
        //       this.vsItems[indx].state.currentHeight = this.vsItems[indx].state.actualHeight
        //       this.vsItems[indx].state.currentWidth = this.vsItems[indx].state.actualWidth
        //       widthChanged = true
        //     }
        //   }
        //   if (widthChanged) this.$nextTick(() => this.itemActiveScrollIntoView('applyItemActualWidth'))
        // }
      }
    },
    scrollLeft: {
      async handler (to, from) {
        // this.$logW(`scrollLeft ${from}->${to}`)
        if (to === 0 && this.itemActive && this.itemActive.indx !== 0) {
          // если итемы меньше чем пол экрана, то первый итем может никогда не стать активным. Домотали до верха - делаем первый активным принудительно
          this.itemActiveIndxReal = this.itemActive.indx // запоминаем настоящий
          this.itemActiveSet(0)
        }
        if (from === 0 && this.itemActiveIndxReal) this.itemActiveSet(this.itemActiveIndxReal) // восстанавливаем
        this.itemActiveLeftUpdate() // update itemActive.left position
      }
    }
  },
  methods: {
    itemResized (indx, height, width) {
      assert(this.vsItems[indx])
      this.$log('resized #', indx, height, width, this.scrolling)
      // eslint-disable-next-line no-constant-condition
      if (!this.scrolling) {
        // скролл стоит. можно менять размер итемов
        this.vsItems[indx].state.currentHeight = height
        this.vsItems[indx].state.currentWidth = width
        this.vsItems[indx].state.actualHeight = height
        this.vsItems[indx].state.actualWidth = width
        this.$nextTick(() => this.itemActiveScrollIntoView('itemResized'))
      } else {
        this.vsItems[indx].state.actualHeight = height // остальное сделается после остановки скролла (scrolling=false)
        this.vsItems[indx].state.actualWidth = width // остальное сделается после остановки скролла (scrolling=false)
      }
    },
    itemActiveLeftUpdate () {
      if (this.itemActive) {
        let left = this.itemActive.ref.getBoundingClientRect().left
        // assert(left <= this.scrollTargetWidth, 'left - это смещение элемента на видимой части экрана')
        if (!this.scrollTargetIsWindow) left -= this.scrollTarget.getBoundingClientRect().left
        this.itemActive.left = left
      }
    },
    // подмотает скролл к itemActive.left
    itemActiveScrollIntoView (from) {
      // без него лучше работает (браузер сам подматывает при измении высоты элементов в скролле)
      // пример в list_feed_custom_ppv.vue
    },
    itemActiveHandler (entry) {
      assert(entry.target.dataset.id)
      let isVisible = !!entry.isIntersecting
      let indx = parseInt(entry.target.dataset.id)
      if (isVisible) {
        this.$log('itemActiveHandler', entry.target.dataset.id)
        this.itemActiveSet(indx)
      } else {
        if (this.itemActive && this.itemActive.indx === indx) {
          this.$log('itemActive reset', indx)
          this.itemActive = null
        }
      }
    },
    itemVisibilityHandler (entry) {
      assert(entry.target.dataset.id)
      let isVisible = !!entry.isIntersecting
      let [key, idxSting] = entry.target.dataset.id.split('-')
      // this.$log('itemVisibilityChanged', isVisible, idxSting, key)
      this.$set_deprecated(this.itemsVisibility, key, isVisible)
    },
    itemActiveSet (indx) {
      this.$log('itemActiveSet', indx)
      assert(indx >= 0 && indx < this.length)
      this.noDummyAreaCenterIndx = indx
      if (this.itemActivePersist) this.itemsRes.setProperty('itemActiveIndx', indx)
      let itemRef = this.$refs[`item-${indx}`]
      let item = this.vsItems[indx]
      assert(itemRef)
      assert(item)
      this.itemActive = {
        indx: indx,
        ref: itemRef,
        item: item,
        name: item.name,
        left: 0
      }
      this.itemActiveLeftUpdate()
      this.$emit('progress', indx / this.length)
    },
    async scrollToStart () {
      this.$log('scrollToStart')
      this.itemActive = null
      setHorizontalScrollPosition(this.scrollTarget, 0)
    },
    async scrollToEnd () {
      this.$log('scrollToEnd')
      this.itemActive = null
      setHorizontalScrollPosition(this.scrollTarget, getScrollWidth(this.scrollTarget))
    },
    scrollUpdate (e) {
      if (!this.debounceScrollingReset) {
        this.debounceScrollingReset = debounce(() => {
          this.scrolling = false
        }, 500)
      }
      this.scrolling = true
      this.debounceScrollingReset()
      if (this.scrollTarget?.document?.activeElement?.className?.includes('q-body--prevent-scroll')) return // поверх списка показали диалог не нужно обновлять scrollLeft(иначе улетит влево)
      // this.scrolledAreaWidth = this.$refs.scrolledArea.clientWidth // обновится чуть позже в scrolledAreaResized (а сейчас scrolledAreaWidth - в неактуальном состоянии. берем актуальные данные)
      this.scrolledAreaWidth = getScrollWidth(this.scrollTarget)// обновится чуть позже в scrolledAreaResized (а сейчас scrolledAreaWidth - в неактуальном состоянии. берем актуальные данные)
      this.scrollLeft = getHorizontalScrollPosition(this.scrollTarget)
      // this.$logD('this.scrollRight', this.scrolledAreaWidth, this.scrollTargetWidth, this.scrollLeft)
      this.scrollRight = this.scrolledAreaWidth - this.scrollTargetWidth - this.scrollLeft
    },
    scrolledAreaResized (e) {
      // this.$logW('scrolledAreaResized', e.width, this.scrollTarget ? getScrollWidth(this.scrollTarget) : '---', this.$refs.scrolledArea.clientWidth)
      // this.scrolledAreaWidth = this.$refs.scrolledArea.clientWidth
      if (!this.scrollTarget) return
      this.scrolledAreaWidth = getScrollWidth(this.scrollTarget)
      this.scrollTargetWidth = this.scrollTargetIsWindow ? this.scrollTarget.innerWidth : this.scrollTarget.clientWidth
      this.scrollUpdate()
    }
  },
  mounted () {
    this.$log('mounted')
    this.scrollTarget = getScrollTarget(this.$el)
    this.$log('this.scrollTarget', this.scrollTarget)
    this.scrollTarget.addEventListener('scroll', this.scrollUpdate)
    this.scrollTarget.addEventListener('resize', this.scrolledAreaResized)
    this.scrollTargetWidth = this.scrollTargetIsWindow ? this.scrollTarget.innerWidth : this.scrollTarget.clientWidth
  },
  beforeUnmount () {
    this.$log('beforeDestroy')
    this.scrollTarget.removeEventListener('scroll', this.scrollUpdate)
    this.scrollTarget.removeEventListener('resize', this.scrolledAreaResized)
  }
}
</script>
