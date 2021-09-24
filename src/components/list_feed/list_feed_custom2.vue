// если указан scrollAreaHeight - сделает внутренний скролл - иначе - воспользуется скроллом window
<template lang="pug">
  div(
    :style=`{maxHeight: scrollAreaHeight ? scrollAreaHeight+'px' : null, height: scrollAreaHeight ? scrollAreaHeight+'px' : null }`
    :class=`{ scroll: !!scrollAreaHeight}`).row.full-width.items-start.content-start
    div(ref="scrolledItems").row.full-width
      q-resize-observer(@resize="scrollResized")
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
                small.full-width scrollTargetHeight: {{ scrollTargetHeight }}
                small.full-width scrollTop: {{ scrollTop }}
                small.full-width scrollBottom: {{ scrollBottom }}
                small.full-width scrolledItemsHeight: {{ scrolledItemsHeight }}
                small.full-width count: {{ length }}
                small(v-if="itemActive").full-width itemActive.top: {{ itemActive.top }}
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
              @click="prev()"
              :loading="itemsResStatus === 'PREV'"
              :color="itemsRes.hasPrev ? 'white' : 'red'"
              :disabled="!itemsRes.hasPrev"
              round flat dense  icon="north").full-width
              //- q-tooltip Назад
            q-btn(
              @click="itemActiveScrollIntoView('BTN')"
              round flat dense color="white" icon="adjust").full-width
            q-btn(
              @click="fill"
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
      slot(name="prepend")
      //- spinner, no itemsRes
      //div(v-if="!itemsRes"  :style=`{position: 'absolute', zIndex: 'auto', top: '50%', left: '50%'}`)
      q-spinner-dots(v-if="!itemsRes" color="green" size="60px").absolute-center
      // headers + items
      .row.full-width
        slot(name="header")
      // sticky header
      div(:style=`{ position: 'sticky', top: '0px', zIndex: 100}`).row.full-width
        q-resize-observer(@resize="stickyHeaderHeight = $event.height")
        slot(name="sticky-header")
      // все загруженные
      div(v-if="itemsRes && itemsRes.fulFilledRange.startFullFil >=0 ").row.full-width
        div(v-for="(itemIndexPlusOne, itemIndex) in itemsRes.loadedLen"
          :ref="`item-${itemIndex}`"
          :key="`item-${itemIndex}`"
          :accessKey="`${itemIndex}`"
          v-observe-visibility=`{
            throttle: 150,
            callback: itemActiveHandler,
            intersection: {
              root: scrollTargetIsWindow ? null : scrollTarget,
              rootMargin: rootMargin,
              //- threshold: 0.9,
            }
          }`
          :style=`{position: 'relative'}`
        ).row.full-width
          div(v-if="itemIndex >= itemsRes.fulFilledRange.startFullFil && itemIndex < itemsRes.fulFilledRange.endFullFil").row.full-width
            div(
              v-for="({source: item, state, debugInfo}) in [vsItems[itemIndex - itemsRes.fulFilledRange.startFullFil]]"
            ).row.full-width
              // item
              div(
                :style=`{ ...itemStyles}`
                :accessKey="`${item[itemKey]}-${itemIndex}`"
                v-observe-visibility=`{
                      throttle: 300,
                      callback: itemVisibilityHandler,
                      intersection: {
                         root: scrollTargetIsWindow ? null : scrollTarget,
                         threshold: 0.2,
                      },
                      }`
              ).row.full-width
                slot(
                  name="item"
                  :item="item"
                  :itemState="state"
                  :itemIndex="itemIndex"
                  :isActive="itemActive && itemActive.indx === itemIndex"
                  :isVisible="!!itemsVisibility[item[itemKey]]",
                  :isPreload="true"
                )
          div(v-else :style=`{height: itemHeightApprox + 'px', minWidth: '300px'}`).row.full-width.br
          span(v-if="$store.state.ui.useDebug" :style=`{color: itemActive && itemIndex === itemActive.indx ? 'green' : 'grey'}`
          ).absolute-top # {{itemIndex}} of {{itemsRes.loadedLen}}
</template>

<script>
import { scroll } from 'quasar'
import { LstCollectionEnum, WsCollectionEnum } from 'src/system/rxdb/common'
import { assert } from 'src/system/common/utils'

const { getScrollTarget, getScrollPosition, setScrollPosition, getScrollHeight } = scroll
// import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock'

export default {
  name: 'listFeed',
  props: {
    scrollAreaHeight: { // если не указано - то скролл - весь window (иначе скролл занимает отведенное место)
      type: Number,
      default: null
    },
    query: {
      type: Object,
      required: true
    },
    itemHeightApprox: { // средний размер одного элемента
      type: Number,
      default: 100
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
    },
    nextSize: {
      type: Number,
      default () {
        if (this.query.rxCollectionEnum in WsCollectionEnum) return 100
        else if (this.query.rxCollectionEnum === LstCollectionEnum.LST_COMMENTS) return 200
        else if (this.query.rxCollectionEnum === LstCollectionEnum.LST_SUBSCRIBERS) return 100
        else if (this.query.rxCollectionEnum === LstCollectionEnum.LST_SUBSCRIPTIONS) return 100
        else if (this.query.rxCollectionEnum in LstCollectionEnum) return 11
        return 11
      }
    },
    screenSize: {
      type: Number,
      default () {
        return 36
      }
    }

  },
  data () {
    return {
      // debug
      debugOpened: false,
      showHeader: false,
      // scrollTarget
      scrollTarget: null,
      scrollTargetHeight: 0,
      // scrollTop
      scrollTop: 0,
      // scrollBottom
      scrollBottom: 0,
      // scrolledItemsHeight
      scrolledItemsHeight: 0,
      itemsRes: null,
      itemsResStatus: null,
      vsItems: [],
      // item
      itemActive: null,
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
      if (this.scrolledItemsHeight >= this.scrollTargetHeight) return '-50% 0px'
      else { // скролл не заполнен
        return `-${Math.ceil(50 * (this.scrolledItemsHeight / this.scrollTargetHeight))}% 0px`
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
        this.itemsRes = await this.$rxdb.find(to, this.nextSize, this.screenSize)
      }
    },
    'itemsRes.items': {
      async handler (to, from) {
        this.$log('itemsRes.items:', to.length, this.itemsRes.loadedLen, this.itemsRes.fulFilledRange, this.itemsRes.getProperty('itemActiveIndx'))
        this.itemActiveTopUpdate()
        this.itemActiveScrollIntoView('itemsRes.items WATCHER')
        this.vsItems = this.vsItems = this.itemsRes.items.map(item => {
          return {
            debugInfo: item.debugInfo,
            source: item.populatedObject || item,
            state: {
              itemId: item[this.itemKey],
              onResize: (itemIndex, heightFrom, heightTo) => {
                // отрендеренный компонент поменял высоту
                // this.$log('onResize item', itemIndex, heightFrom, heightTo)
                if (heightFrom && itemIndex < this.itemActiveIndx) {
                  // элемент вверху изменил размер. Если ничего не делать - скролл будет дергаться
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
        this.$log('vsitems=', this.vsItems)
        this.$nextTick(() => {
          this.$log('itemsRes.items $nextTick')
          if (!this.itemActive && this.itemsRes.getProperty('itemActiveIndx')) this.itemActiveSet(this.itemsRes.getProperty('itemActiveIndx'))
          this.itemActiveScrollIntoView('itemsRes.items WATCHER $nextTick')
        })
        this.$emit('count', to.length - 2)
      }
    },
    // watch it to drop position, and scrollToTop
    '$store.state.ui.listFeedGoToStart': {
      deep: true,
      // immediate: true,
      async handler (to, from) {
        this.$log('$store.state.ui.listFeedGoToStart TO', to)
        if (to) {
          this.$store.commit('ui/stateSet', ['listFeedGoToStart', false])
          await this.scrollToStart()
        }
      }
    },
    scrolledItemsHeight: {
      async handler (to, from) {
        // this.$log(`scrolledItemsHeight ${from}->${to}`)
        this.itemActiveScrollIntoView('scrolledItemsHeight IN')
      }
    },
    scrollTop: {
      async handler (to, from) {
        // this.$logW(`scrollTop ${from}->${to}`)
        // update itemActive.top position
        this.itemActiveTopUpdate()
      }
    },
    scrollBottom: {
      async handler (to, from) {
        // this.$logW(`scrollBottom ${from}->${to}`)
        await this.fill()
      }
    }
  },
  methods: {
    // debug purpose only
    itemActiveGetPosition () {
      this.$log('itemActiveGetPosition')
      if (!this.itemActive) return
      let itemActiveOffsetTop = this.itemActive.ref.offsetTop
      let itemActiveOffsetParent = this.itemActive.ref.offsetParent
      let itemActiveRect = this.itemActive.ref.getBoundingClientRect()
      this.$log('itemActive', { itemActiveOffsetTop, itemActiveOffsetParent, itemActiveRect })
      let itemsResWrapperRef = this.$refs['items-res-wrapper']
      let itemsResWrapperRect = itemsResWrapperRef.getBoundingClientRect()
      let itemsResWrapperOffsetTop = itemsResWrapperRef.offsetTop
      let itemsResWrapperOffsetParent = itemsResWrapperRef.offsetParent
      this.$log('itemsResWrapper', { itemsResWrapperRect, itemsResWrapperOffsetTop, itemsResWrapperOffsetParent })
      this.$log('itemsVisibility', this.itemsVisibility)
      if (this.itemActive) this.$log('itemActive.item.debugInfo()', this.itemActive.item.debugInfo())
      // let scrollTarget
    },
    itemActiveTopUpdate () {
      if (this.itemActive) {
        let top = this.itemActive.ref.getBoundingClientRect().top
        if (!this.scrollTargetIsWindow) top -= this.scrollTarget.getBoundingClientRect().top
        this.itemActive.top = top
      }
    },
    // подмотает скролл к itemActive.top
    itemActiveScrollIntoView (from) {
      this.$log('imsiv start', from)
      const scrollWithScrollIntoView = async () => {
        if (this.scrollTargetIsWindow) {
          // just scroll to item
          this.itemActive.ref.scrollIntoView()
          // add itemActive.top position
          setScrollPosition(this.scrollTarget, getScrollPosition(this.scrollTarget) - this.itemActive.top)
        } else {
          // get window scrollTop before
          let windowScrollTopBefore = getScrollPosition(window)
          this.$log('windowScrollTopBefore', windowScrollTopBefore)
          // block scrolles
          // disableBodyScroll(this.scrollTarget)
          // await this.$wait(300)
          // scrollTo item
          this.itemActive.ref.scrollIntoView()
          // unblock scrolles
          // enableBodyScroll(this.scrollTarget)
          // get window scrollTop before
          let windowScrollTopAfter = getScrollPosition(window)
          this.$log('windowScrollTopAfter', windowScrollTopAfter)
          // return window scrollTop if
          setScrollPosition(window, windowScrollTopBefore)
          // add itemActive.top position
          setScrollPosition(this.scrollTarget, getScrollPosition(this.scrollTarget) - this.itemActive.top)
        }
      }
      const scrollWithOffsetTop = () => {
        let offsetTop = this.itemActive.ref.offsetTop
        this.$log('imsiv offsetTop', offsetTop)
        let offsetTopScrollTarget = this.scrollTargetIsWindow ? 0 : this.scrollTarget.offsetTop
        this.$log('imsiv offsetTopScrollTarget', offsetTopScrollTarget)
        let top = this.itemActive.top
        this.$log('imsiv top', top)
        let scrollPosition = offsetTop - offsetTopScrollTarget - top
        this.$log('imsiv scrollPosition', scrollPosition)
        setScrollPosition(this.scrollTarget, scrollPosition)
      }
      if (this.itemActive) {
        scrollWithScrollIntoView()
        this.$log('imsiv done')
      } else {
        this.$log('imsiv itemActive NOT FOUND, failed, go to TOP')
        setScrollPosition(this.scrollTarget, 0)
      }
    },
    itemActiveHandler (isVisible, entry) {
      // let [key, idxSting] = entry.target.accessKey.split('-')
      if (isVisible) {
        // this.$log('itemActiveHandler', entry.target.accessKey)
        this.itemActiveSet(parseInt(entry.target.accessKey))
      }
    },
    itemVisibilityHandler (isVisible, entry) {
      let [key, idxSting] = entry.target.accessKey.split('-')
      // this.$log('itemVisibilityChanged', isVisible, idxSting, key)
      this.$set(this.itemsVisibility, key, isVisible)
    },
    itemActiveSet (indx) {
      this.$log('itemActiveSet', indx)
      assert(indx >= 0 && indx < this.length)
      if (this.itemActivePersist) this.itemsRes.setProperty('itemActiveIndx', indx)
      let itemRef = this.$refs[`item-${indx}`]
      assert(itemRef && itemRef[0])
      itemRef = itemRef[0]
      let item = indx >= this.itemsRes.fulFilledRange.startFullFil && indx < this.itemsRes.fulFilledRange.endFullFil
          ? this.vsItems[indx - this.itemsRes.fulFilledRange.startFullFil] : null
      this.itemActive = {
        indx: indx,
        ref: itemRef,
        item: item,
        name: item?.name,
        top: 0
      }
      this.itemActiveTopUpdate()
      this.$emit('progress', indx / this.itemsRes.loadedLen)
    },
    async fill () {
      if (this.scrollTop < this.scrollTargetHeight) await this.prev() // если вверху меньше экрана
      else if (this.scrollBottom < this.scrollTargetHeight) await this.next() // если внизу меньше экрана
    },
    async scrollToStart () {
      this.$log('scrollToStart')
      this.itemActive = null
      await this.itemsRes.gotoStart()
      setScrollPosition(this.scrollTarget, 0)
    },
    async scrollToEnd () {
      this.$log('scrollToEnd')
      this.itemActive = null
      await this.itemsRes.gotoEnd()
      setScrollPosition(this.scrollTarget, 0)
    },
    async prev () {
      if (!this.itemsRes) return
      if (!this.itemsRes.hasPrev) return
      if (this.itemsResStatus) return
      if (Date.now() - this.nextCompleteDt < 2000) return // PPV при попытке промотки вверх когда список в начале - скролл оттягивается вверх, а потом вниз и поэтому может сработать next()
      this.$log('prev')
      this.itemsResStatus = 'PREV'
      this.$log('prev start')
      if (this.$store.state.ui.useDebug) this.$q.notify({ type: 'positive', message: 'Prev !', position: 'top-right' })
      await this.itemsRes.prev(this.nextSize)
      this.$log('prev done')
      this.itemsResStatus = null
      this.prevCompleteDt = Date.now()
      this.$log('prev complete')
    },
    async next () {
      if (!this.itemsRes) return
      if (!this.itemsRes.hasNext) return
      if (this.itemsResStatus) return
      if (Date.now() - this.prevCompleteDt < 2000) return // PPV при попытке промотки вниз когда список закончился - скролл оттягивается вниз, а потом вверх и поэтому может сработать prev()
      this.$log('next. this.nextSize=', this.nextSize)
      this.itemsResStatus = 'NEXT'
      this.$log('next start')
      if (this.$store.state.ui.useDebug) {
        this.$q.notify({
          type: 'positive',
          message: 'Next !',
          position: 'bottom-right'
        })
      }
      this.$log('before next', this.length)
      await this.itemsRes.next(this.nextSize)
      this.$log('next done', this.length)
      this.itemsResStatus = null
      this.nextCompleteDt = Date.now()
    },
    scrollUpdate (e) {
      if (this.scrollTarget?.document?.activeElement?.className?.includes('q-body--prevent-scroll')) return // поверх списка показали диалог не нужно обновлять scrollTop(иначе улетит вверх)
      this.scrolledItemsHeight = this.$refs.scrolledItems.clientHeight // обновится чуть позже в scrollResized (а сейчас scrolledItemsHeight - в неактуальном состоянии. берем актуальные данные)
      this.scrollTop = getScrollPosition(this.scrollTarget)
      this.scrollBottom = this.scrolledItemsHeight - this.scrollTargetHeight - this.scrollTop
      this.emitShowHeader(this.scrollTop)
    },
    scrollResized (e) {
      // this.$logW('scrollResized', e.height, this.scrollTarget ? getScrollHeight(this.scrollTarget) : '---', this.$refs.scrolledItems.clientHeight)
      this.scrolledItemsHeight = this.$refs.scrolledItems.clientHeight
      if (!this.scrollTarget) return
      this.scrollTargetHeight = this.scrollTargetIsWindow ? this.scrollTarget.innerHeight : this.scrollTarget.clientHeight
      this.scrollUpdate()
    },
    emitShowHeader (scrollTop) {
      // едем вниз/вверх более 1 сек и более 200 px
      let minScrollLen = 200
      let minScrollDur = 1000
      if (!this.scrollState) {
        this.scrollState = { direction: null, startTm: 0, startPos: 0, lastScrollTop: 0, showHeader: true }
      }
      let scrollDirection = null
      if (this.scrollState.lastScrollTop > scrollTop) scrollDirection = 'up'
      if (this.scrollState.lastScrollTop < scrollTop) scrollDirection = 'down'
      if (this.scrollState.direction !== scrollDirection) { // изменилось направление
        this.scrollState.direction = scrollDirection
        this.scrollState.startTm = Date.now()
        this.scrollState.startPos = scrollTop
      }
      this.scrollState.lastScrollTop = scrollTop

      // едем вниз более 1 сек и проехали более 200 px
      if (this.scrollState.direction === 'down' &&
          Date.now() - this.scrollState.startTm > minScrollDur &&
          Math.abs(this.scrollState.lastScrollTop - this.scrollState.startPos) > minScrollLen) {
        // this.$emit('progress', this.scrollTop / this.scrolledItemsHeight)
        if (this.scrollState.showHeader) {
          this.scrollState.showHeader = false
          this.$emit('showHeader', this.scrollState.showHeader)
        }
      }

      // едем вверх более 1 сек и проехали более 200 px
      if ((scrollTop === 0) || (this.scrollState.direction === 'up' &&
          Date.now() - this.scrollState.startTm > minScrollDur &&
          Math.abs(this.scrollState.lastScrollTop - this.scrollState.startPos) > minScrollLen)) {
        // this.$emit('progress', this.scrollTop / this.scrolledItemsHeight)
        if (!this.scrollState.showHeader) {
          this.scrollState.showHeader = true
          this.$emit('showHeader', this.scrollState.showHeader)
        }
      }
      // мы на самом верху
      if (scrollTop === 0) {
        this.scrollState.showHeader = true
      }
    },
    async gotoPercent (percent) {
      await this.itemsRes.gotoPercent(percent)
    }
  },
  mounted () {
    this.$log('mounted')
    this.scrollTarget = getScrollTarget(this.$el)
    // this.$log('this.scrollTarget', this.scrollTarget)
    this.scrollTarget.addEventListener('scroll', this.scrollUpdate)
    this.scrollTarget.addEventListener('resize', this.scrollResized)
    this.scrollTargetHeight = this.scrollTargetIsWindow ? this.scrollTarget.innerHeight : this.scrollTarget.clientHeight
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    this.scrollTarget.removeEventListener('scroll', this.scrollUpdate)
    this.scrollTarget.removeEventListener('resize', this.scrollResized)
  }
}
</script>
