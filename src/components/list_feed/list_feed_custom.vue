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
              small(v-if="itemMiddle").full-width itemMiddle.top: {{ itemMiddle.top }}
              q-btn(
                @click="itemMiddleGetPosition"
                outline dense no-caps align="lef" size="sm"
                color="purple"
              ).full-width.q-mb-xs itemMiddle position?
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
            @click="itemMiddleScrollIntoView('BTN')"
            round flat dense color="white" icon="adjust").full-width
          q-btn(
            @click="scrollToCurrent"
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
    //- items
    div(
      v-if="itemsRes"
      ref="items-res-wrapper"
      :style=`{
      position: 'relative',
      }`
    ).row.full-width.items-start.content-start
      div(
        v-for="({source: item, state}, itemIndex) in vsItems"
        :key="item[itemKey]"
        :ref="`item-${item[itemKey]}`"
        :data-id="`${item[itemKey]}-${itemIndex}`"
        :class=`{
        //- 'bg-red': item[itemKey] === (itemMiddle ? itemMiddle.key : undefined),
         }`
        :style=`{
        position: 'relative'}`
        v-intersection=`{
        handler: $throttle(itemMiddleHandler, 150),
        cfg: {
          root: scrollTargetIsWindow ? null : scrollTarget,
          rootMargin: rootMargin,
          //- threshold: 0.9,
        }
      }`
      ).row.full-width
        //- prev loading
        div(v-if="item[itemKey] === 'header'" :style=`{position: 'relative', height: '30px'}`).row.full-width
          q-spinner-dots(v-if="itemsResStatus === 'PREV'" color="green" size="50px").absolute-center
          q-btn(v-else-if="itemsRes.hasPrev" @click="prev" flat outline round color="green").fit
            q-icon(name="expand_less" size="50px").absolute-center
        //- next loading
        div(v-else-if="item[itemKey] === 'footer'" :style=`{position: 'relative', height: '30px'}`).row.full-width
          q-spinner-dots(v-if="itemsResStatus === 'NEXT'" color="green" size="50px").absolute-center
          q-btn(v-else-if="itemsRes.hasNext" @click="next" flat outline round color="green").fit
            q-icon(name="expand_more" size="50px").absolute-center
        // item
        div(
          v-else
          :style=`{
            position: 'relative',
            ...itemStyles}`
          :data-id="`${item[itemKey]}-${itemIndex}`"
          v-intersection=`{
          handler: $throttle(itemVisibilityHandler, 300),
          cfg: {
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
            :isActive="item[itemKey] === (itemMiddle ? itemMiddle.key : undefined)"
            :isVisible="!!itemsVisibility[item[itemKey]]",
            :isPreload="true"
            )
          span(v-if="$store.state.ui.useDebug" :style=`{color: item[itemKey] === (itemMiddle ? itemMiddle.key : undefined) ? 'green' : 'grey'}`
          ).absolute-top # {{itemIndex-1}} of {{itemsRes.itemsHeaderFooter.length-2}} {{item[itemKey]}} {{!!itemsVisibility[item[itemKey]] ? '-----VISIBLE' : ''}}
          span(v-if="$store.state.ui.useDebug" :style=`{color: item[itemKey] === (itemMiddle ? itemMiddle.key : undefined) ? 'green' : 'grey'}`
          ).absolute-center.text-bold.text-h1.z-max {{'debugInfo().indx'}}
    slot(name="append")
  //// scrollbar
  //div(
  //  :style=`{
  //     width: '20px',
  //     borderRadius: '5px'
  //  }`
  //  @click="$logW('click', $event)"
  //).columm.fixed-right.z-top.q-my-xl.br
  //  div(
  //    :style=`{
  //        position: 'absolute',
  //        top: '100px',
  //        height: '30px',
  //        borderRadius: '5px'
  //     }`
  //  ).row.full-width.br
</template>

<script>
import { scroll } from 'quasar'
import { LstCollectionEnum, WsCollectionEnum } from 'src/system/rxdb/common'
import { assert } from 'src/system/common/utils'

const { getScrollTarget, getVerticalScrollPosition, setVerticalScrollPosition, getScrollHeight } = scroll
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
      default (props) {
        if (props.query.rxCollectionEnum in WsCollectionEnum) return 100
        else if (props.query.rxCollectionEnum === LstCollectionEnum.LST_COMMENTS) return 200
        else if (props.query.rxCollectionEnum === LstCollectionEnum.LST_SUBSCRIBERS) return 100
        else if (props.query.rxCollectionEnum === LstCollectionEnum.LST_SUBSCRIPTIONS) return 100
        else if (props.query.rxCollectionEnum in LstCollectionEnum) return 11
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
      itemMiddleHistory: [],
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
    itemMiddle: {
      // геттер:
      get: function () {
        return this.itemMiddleHistory[0]
      },
      // сеттер:
      set: function (newValue) {
        if (newValue) this.itemMiddleHistory.unshift(newValue) // добавим вверх
        else this.itemMiddleHistory.splice(0, 1) // удалим верхний
        this.itemMiddleHistory.splice(8, this.itemMiddleHistory.length) // в истории - не больше 8 элементов
      }
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
        // this.$log('itemsRes:', this.nextSize, this.screenSize, this.itemsRes)
      }
    },
    'itemsRes.itemsHeaderFooter': {
      deep: true,
      async handler (to, from) {
        this.$log('itemsRes.itemsHeaderFooter:', to.length, this.itemsRes.getProperty('currentId'))
        // удаляем те, которых нет в новом списке
        for (let itemMiddle of this.itemMiddleHistory) {
          itemMiddle.item = this.itemsRes.itemsHeaderFooter.find(item => item[this.itemKey] === itemMiddle.key)
          // this.$log('ims item.name', item?.name)
          let itemRef = this.$getRef(`item-${itemMiddle.key}`)
          if (itemRef) itemMiddle.ref = itemRef
        }
        this.itemMiddleHistory.splice(0, this.itemMiddleHistory.length, ...this.itemMiddleHistory.filter(im => !!im.item && !!im.ref)) // удаляем те, которых нет в новом списке
        this.itemMiddleTopUpdate()
        this.itemMiddleScrollIntoView('itemsRes.itemsHeaderFooter WATCHER')
        this.vsItems = this.vsItems = this.itemsRes.itemsHeaderFooter.map(item => {
          return {
            // debugInfo: item.debugInfo,
            source: item.populatedObject || item,
            state: {
              itemId: item[this.itemKey],
              onResize: (itemIndex, heightFrom, heightTo) => {
                // отрендеренный компонент поменял высоту
                // this.$log('onResize item', itemIndex, heightFrom, heightTo)
                if (heightFrom && itemIndex < this.itemMiddleIndx) {
                  // элемент вверх изменил размер. Если ничего не делать - скролл будет дергаться
                  let diff = heightTo - heightFrom
                  if (diff) {
                    this.$log('onResize item', itemIndex, 'diff=', diff)
                    this.$log('getVerticalScrollPosition', getVerticalScrollPosition(this.scrollTarget))
                    // setVerticalScrollPosition(this.scrollTarget, getVerticalScrollPosition(this.scrollTarget) + diff)
                  }
                }
              }
            }
          }
        }) || []
        this.$nextTick(() => {
          this.$log('itemsRes.itemsHeaderFooter $nextTick')
          if (!this.itemMiddle && this.itemsRes.getProperty('currentId')) {
            let indx = this.itemsRes.itemsHeaderFooter.findIndex(item => item[this.itemKey] === this.itemsRes.getProperty('currentId'))
            if (indx >= 0) this.itemMiddleSet(this.itemsRes.getProperty('currentId'), indx)
          }
          this.itemMiddleScrollIntoView('itemsRes.itemsHeaderFooter WATCHER $nextTick')
        })
        this.$emit('count', to.length - 2)
      }
    },
    scrolledItemsHeight: {
      async handler (to, from) {
        // this.$log(`scrolledItemsHeight ${from}->${to}`)
        this.itemMiddleScrollIntoView('scrolledItemsHeight IN')
      }
    },
    scrollTop: {
      async handler (to, from) {
        // this.$logW(`scrollTop ${from}->${to}`)
        // update itemMiddle.top position
        this.itemMiddleTopUpdate()
      }
    },
    scrollBottom: {
      async handler (to, from) {
        // this.$logW(`scrollBottom ${from}->${to}`)
        await this.fillMore()
      }
    },
  },
  methods: {
    // debug purpose only
    itemMiddleGetPosition () {
      this.$log('itemMiddleGetPosition')
      if (!this.itemMiddle) return
      let itemMiddleOffsetTop = this.itemMiddle.ref.offsetTop
      let itemMiddleOffsetParent = this.itemMiddle.ref.offsetParent
      let itemMiddleRect = this.itemMiddle.ref.getBoundingClientRect()
      this.$log('itemMiddle', { itemMiddleOffsetTop, itemMiddleOffsetParent, itemMiddleRect })
      let itemsResWrapperRef = this.$refs['items-res-wrapper']
      let itemsResWrapperRect = itemsResWrapperRef.getBoundingClientRect()
      let itemsResWrapperOffsetTop = itemsResWrapperRef.offsetTop
      let itemsResWrapperOffsetParent = itemsResWrapperRef.offsetParent
      this.$log('itemsResWrapper', { itemsResWrapperRect, itemsResWrapperOffsetTop, itemsResWrapperOffsetParent })
      this.$log('itemsVisibility', this.itemsVisibility)
      // if (this.itemMiddle) this.$log('itemMiddle.item.debugInfo()', this.itemMiddle.item.debugInfo())
      // let scrollTarget
    },
    // обновит itemMiddle.top для каждого элемента в itemMiddleHistory
    itemMiddleTopUpdate () {
      for (let itemMiddle of this.itemMiddleHistory) {
        let top = itemMiddle.ref.getBoundingClientRect().top
        if (!this.scrollTargetIsWindow) top -= this.scrollTarget.getBoundingClientRect().top
        itemMiddle.top = top
      }
    },
    // подмотает скролл к itemMiddle.top
    itemMiddleScrollIntoView (from) {
      this.$log('imsiv start', from)
      const scrollWithScrollIntoView = async () => {
        if (this.scrollTargetIsWindow) {
          // just scroll to item
          this.itemMiddle.ref.scrollIntoView()
          // add itemMiddle.top position
          setVerticalScrollPosition(this.scrollTarget, getVerticalScrollPosition(this.scrollTarget) - this.itemMiddle.top)
        } else {
          // get window scrollTop before
          let windowScrollTopBefore = getVerticalScrollPosition(window)
          this.$log('windowScrollTopBefore', windowScrollTopBefore)
          // block scrolles
          // disableBodyScroll(this.scrollTarget)
          // await this.$wait(300)
          // scrollTo item
          this.itemMiddle.ref.scrollIntoView()
          // unblock scrolles
          // enableBodyScroll(this.scrollTarget)
          // get window scrollTop before
          let windowScrollTopAfter = getVerticalScrollPosition(window)
          this.$log('windowScrollTopAfter', windowScrollTopAfter)
          // return window scrollTop if
          setVerticalScrollPosition(window, windowScrollTopBefore)
          // add itemMiddle.top position
          setVerticalScrollPosition(this.scrollTarget, getVerticalScrollPosition(this.scrollTarget) - this.itemMiddle.top)
        }
      }
      const scrollWithOffsetTop = () => {
        let offsetTop = this.itemMiddle.ref.offsetTop
        this.$log('imsiv offsetTop', offsetTop)
        let offsetTopScrollTarget = this.scrollTargetIsWindow ? 0 : this.scrollTarget.offsetTop
        this.$log('imsiv offsetTopScrollTarget', offsetTopScrollTarget)
        let top = this.itemMiddle.top
        this.$log('imsiv top', top)
        let scrollPosition = offsetTop - offsetTopScrollTarget - top
        this.$log('imsiv scrollPosition', scrollPosition)
        setVerticalScrollPosition(this.scrollTarget, scrollPosition)
      }
      if (this.itemMiddle) {
        scrollWithScrollIntoView()
        this.$log('imsiv done')
      } else {
        this.$log('imsiv itemMiddle NOT FOUND, failed, go to TOP')
        setVerticalScrollPosition(this.scrollTarget, 0)
      }
    },
    itemMiddleHandler (entry) {
      assert(entry.target.dataset.id)
      let isVisible = !!entry.isIntersecting
      let [key, idxSting] = entry.target.dataset.id.split('-')
      if (isVisible) {
        // this.$log('isVisible', entry.target.dataset.id)
        this.itemMiddleSet(key, parseInt(idxSting))
      } else {
        if (this.itemMiddle && this.itemMiddle.key === key) {
          // PPV Закомментил тк сначала приходит isVisible === false для старого элемента, а потом isVisible === true - для нового (а в промежуток вклинивается itemMiddleScrollIntoView(ей нужен itemMiddle(иначе она мотает к верху)))
          // this.$log('itemMiddle HIDE', this.itemMiddle.idx)
          // this.itemMiddle = null
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
    itemMiddleSet (key, idx) {
      this.$log('ims', idx)
      assert(key && idx >= 0)
      if (key.in('header', 'footer')) return
      if (this.itemActivePersist) this.itemsRes.setProperty('currentId', key)
      let item = this.itemsRes.itemsHeaderFooter[idx]
      // this.$log('ims item.name', item?.name)
      let itemRef = this.$getRef(`item-${key}`)
      if (itemRef) {
        this.itemMiddle = {
          key: key,
          // idx: idx -  можем и запоминать, но тогда надо будет синхронищировать в вотчере при изменении itemsRes
          ref: itemRef,
          item: item,
          name: item?.name,
          top: 0
        }
        this.itemMiddleTopUpdate()
        if (this.itemsRes.fulFilledRange.startFullFil >= 0 && this.itemsRes.loadedLen) this.$emit('progress', (idx + this.itemsRes.fulFilledRange.startFullFil) / this.itemsRes.loadedLen)
      } else {
        this.$logE('ims itemRef NOT FOUND', key, idx, item?.name, this.itemsRes)
      }
    },
    async fillMore() {
      if (this.scrollTop < this.scrollTargetHeight) await this.prev() // если вверху меньше экрана
      else if (this.scrollBottom < this.scrollTargetHeight) await this.next() // если внизу меньше экрана
    },
    async scrollToCurrent () {
      this.$log('scrollToCurrent')
      this.itemMiddleHistory.splice(0, this.itemMiddleHistory.length)
      await this.itemsRes.gotoCurrent()
    },
    async scrollToStart () {
      this.$log('scrollToStart')
      this.itemMiddleHistory.splice(0, this.itemMiddleHistory.length)
      await this.itemsRes.gotoStart()
      setVerticalScrollPosition(this.scrollTarget, 0)
    },
    async scrollToEnd () {
      this.$log('scrollToEnd')
      this.itemMiddleHistory.splice(0, this.itemMiddleHistory.length)
      await this.itemsRes.gotoEnd()
      setVerticalScrollPosition(this.scrollTarget, 0)
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
      this.scrollTop = getVerticalScrollPosition(this.scrollTarget)
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
    async gotoPercent(percent) {
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
  beforeUnmount () {
    this.$log('beforeDestroy')
    this.scrollTarget.removeEventListener('scroll', this.scrollUpdate)
    this.scrollTarget.removeEventListener('resize', this.scrollResized)
  }
}
</script>
