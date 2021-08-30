// если указан scrollAreaHeight - сделает внутренний скролл - иначе - воспользуется скроллом window
<template lang="pug">
  div(:style=`{maxHeight: scrollAreaHeight+'px', height: scrollAreaHeight+'px'}` :class=`{ scroll: !!scrollAreaHeight}`).row.full-width.items-start.content-start
    q-resize-observer(@resize="scrollHeightResized")
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
              small.full-width scrollTargetWidth: {{ scrollTargetWidth }}
              small(:class=`{'bg-red': scrollTopChanging}`).full-width scrollTop: {{ scrollTop }}
              small.full-width scrollBottom: {{ scrollBottom }}
              small(:class=`{'bg-red-3': scrollHeightChanging}`).full-width scrollHeight: {{ scrollHeight }}
              small.full-width itemsRes.itemsHeaderFooter: {{ itemsRes.itemsHeaderFooter.length }}
              small(v-if="itemMiddle").full-width itemMiddle.top: {{ itemMiddle.top }}
              small(v-if="itemMiddle").full-width itemMiddle.indx: {{ itemMiddle.item.debugInfo().indx }}
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
            @click="positionDrop()"
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
            @click="positionStartHere()"
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
    div(v-if="!itemsRes"  :style=`{position: 'absolute', zIndex: 'auto', top: '50%', left: '50%'}`)
      q-spinner-dots(color="green" size="60px")
    //- items
    div(
      v-if="itemsRes"
      ref="items-res-wrapper"
      :style=`{
      position: 'relative',
      }`
    ).row.full-width.items-start.content-start
      div(
        v-for="(item, itemIndex) in itemsRes.itemsHeaderFooter"
        :key="item[itemKey]"
        :ref="`item-${item[itemKey]}`"
        :accessKey="`${item[itemKey]}-${itemIndex}`"
        :class=`{
        //- 'bg-red': item[itemKey] === (itemMiddle ? itemMiddle.key : undefined),
         }`
        :style=`{
        position: 'relative'}`
        v-observe-visibility=`{
        throttle: 150,
        callback: itemMiddleHandler,
        intersection: {
          root: scrollTargetIsWindow ? null : scrollTarget,
          rootMargin: rootMargin,
          //- threshold: 0.9,
        }
      }`
      ).row.full-width
        //item slot
        //- prev loading
        div(v-if="item[itemKey] === 'header'" :style=`{height: '30px'}`).row.full-width
          q-spinner-dots(v-if="itemsResStatus === 'PREV'" color="green" size="50px" :style=`{position: 'absolute', left: '50%', top: '-10px'}`)
          q-btn(v-else-if="itemsRes.hasPrev" @click="prev" flat outline round color="green").full-width.full-height
            q-icon(name="expand_less" size="50px" :style=`{position: 'absolute', left: '50%', top: '-10px'}`)
        //- next loading + компенсация kalpa-menu-mobile
        div(v-else-if="item[itemKey] === 'footer'" :style=`{height: '30px'}`).row.full-width
          q-spinner-dots(v-if="itemsResStatus === 'NEXT'" color="green" size="50px" :style=`{position: 'absolute', left: '50%', top: '-10px'}`)
          q-btn(v-else-if="itemsRes.hasNext" @click="next" flat outline round color="green" :style=`{height: '30px'}`).full-width
            q-icon(name="expand_more" size="50px" :style=`{position: 'absolute', left: '50%', top: '-10px'}`)
        // item
        div(v-else  :style=`{...itemStyles}`).row.full-width
          span(v-if="$store.state.ui.useDebug" :style=`{color: itemMiddle && itemMiddle.key === item[itemKey] ? 'green' : 'white'}`) {{ item.debugInfo() }}
          slot(
            name="item"
            :item="item"
            :itemIndex="itemIndex"
            :isActive="item[itemKey] === (itemMiddle ? itemMiddle.key : undefined)"
            :isVisible="itemMiddle ? (itemMiddle.idx === itemIndex-1 || itemMiddle.idx === itemIndex+1) : false")
    slot(name="append")
</template>

<script>
import { scroll } from 'quasar'
import { LstCollectionEnum, WsCollectionEnum } from 'src/system/rxdb/common'

const { getScrollTarget, getScrollPosition, setScrollPosition, getScrollHeight } = scroll
// import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock'

export default {
  name: 'listFeed',
  props: {
    scrollAreaHeight: { // если не указано - то скролл - весь window (иначе скролл занимает отведенное место)
      type: Number,
      default: null
    },
    rootMargin: {
      type: String,
      default () {
        return '-50% 0px'
      }
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
    itemMiddlePersist: {
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
      scrollTargetWidth: 0,
      // scrollTop
      scrollTop: 0,
      scrollTopTimeout: null,
      scrollTopChanging: false,
      // scrollBottom
      scrollBottom: 0,
      // scrollHeight
      scrollHeight: 0,
      scrollHeightTimeout: null,
      scrollHeightChanging: false,
      itemsRes: null,
      itemsResStatus: null,
      // item
      itemMiddle: null,
      itemMiddleIndex: null
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
    itemKey () {
      return this.itemsRes?.itemPrimaryKey
    },
    scrollTargetIsWindow () {
      return this.scrollTarget === window
    },
    paginationBufferHeight () {
      return this.scrollTargetHeight
    }
  },
  watch: {
    query: {
      immediate: true,
      async handler (to, from) {
        this.itemsRes = await this.$rxdb.find(to, this.nextSize, this.screenSize)
      }
    },
    'itemsRes.itemsHeaderFooter': {
      async handler (to, from) {
        this.$log('itemsRes.itemsHeaderFooter TO', to.length, this.itemsRes, this.itemsRes.hasPrev)
        this.itemMiddleScrollIntoView('itemsRes.itemsHeaderFooter WATCHER')
        this.$nextTick(() => {
          this.$log('itemsRes.itemsHeaderFooter $nextTick')
          if (!this.itemMiddle && this.itemsRes.getProperty('currentId')) {
            this.itemMiddleSet(this.itemsRes.getProperty('currentId'), 0, false)
          }
          this.itemMiddleScrollIntoView('itemsRes.itemsHeaderFooter WATCHER $nextTick')
        })
      }
    },
    // watch it to drop position, and scrollToTop
    '$store.state.ui.listFeedNeedDrop': {
      deep: true,
      // immediate: true,
      async handler (to, from) {
        this.$log('$store.state.ui.listFeedNeedDrop TO', to)
        if (to) {
          this.$store.commit('ui/stateSet', ['listFeedNeedDrop', false])
          await this.positionDrop()
        }
      }
    },
    scrollTop: {
      async handler (to, from) {
        // this.$log('scrollTop To/From:', to, from)

        // update itemMiddle.top position
        this.itemMiddleTopUpdate()

        // wait for the end
        if (this.scrollTopTimeout) {
          clearTimeout(this.scrollTopTimeout)
          this.scrollTopTimeout = null
        }
        if (!this.scrollTopChanging) this.$log('scrollTop START')
        // handle prev/next...
        if (to < this.paginationBufferHeight) await this.prev()
        if (this.scrollBottom < this.paginationBufferHeight) await this.next()
        // changing...
        this.scrollTopChanging = true
        this.scrollTopTimeout = setTimeout(async () => {
          // END of scrollTopChanging
          this.$log('scrollTop END')
          this.scrollTopChanging = false
          // if (this.scrollTop < this.paginationBufferHeight) await this.prev()
          // if (this.scrollBottom < this.paginationBufferHeight) await this.next()
        }, 600)
      }
    },
    scrollHeight: {
      async handler (to, from) {
        // this.$log('scrollHeight To/From:', to, from)

        // wait for the end
        if (!this.scrollHeightChanging) this.$log('scrollHeight START')
        if (this.scrollHeightTimeout) {
          clearTimeout(this.scrollHeightTimeout)
          this.scrollHeightTimeout = null
          this.itemMiddleScrollIntoView('scrollHeight IN')
        }
        this.scrollHeightChanging = true
        this.scrollHeightTimeout = setTimeout(() => {
          this.scrollHeightChanging = false

          // END of scrollHeightChanging
          this.$log('scrollHeight END')
          // this.itemMiddleScrollIntoView('scrollHeight END')
          // handle AUTO prev
          if (this.itemsRes && this.itemsRes.hasPrev && this.scrollTop < this.paginationBufferHeight) {
            // alert('AUTO prev')
            this.prev()
          }
        }, 600)
      }
    }
  },
  methods: {
    itemMiddleHandlerTest (isVisible, entry) {
      if (isVisible) {
        this.$log('scrollTarget', this.scrollTarget)
        this.$log('itemMiddleHandlerTest', isVisible, entry.target.accessKey)
        this.itemMiddleIndex = parseInt(entry.target.accessKey)
      }
    },
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
      // let scrollTarget
    },
    itemMiddleTopUpdate () {
      if (!this.itemMiddle) return
      // if (this.scrollHeightChanging) return
      let top = this.itemMiddle.ref.getBoundingClientRect().top
      if (!this.scrollTargetIsWindow) top -= this.scrollTarget.getBoundingClientRect().top
      // this.$log('itemMiddleTopUpdate', top)
      this.itemMiddle.top = top
    },
    itemMiddleScrollIntoView (from) {
      this.$log('imsiv start', from)
      const scrollWithScrollIntoView = async () => {
        if (this.scrollTargetIsWindow) {
          // just scroll to item
          this.itemMiddle.ref.scrollIntoView()
          // add itemMiddle.top position
          setScrollPosition(this.scrollTarget, getScrollPosition(this.scrollTarget) - this.itemMiddle.top)
        } else {
          // get window scrollTop before
          let windowScrollTopBefore = getScrollPosition(window)
          this.$log('windowScrollTopBefore', windowScrollTopBefore)
          // block scrolles
          // disableBodyScroll(this.scrollTarget)
          // await this.$wait(300)
          // scrollTo item
          this.itemMiddle.ref.scrollIntoView()
          // unblock scrolles
          // enableBodyScroll(this.scrollTarget)
          // get window scrollTop before
          let windowScrollTopAfter = getScrollPosition(window)
          this.$log('windowScrollTopAfter', windowScrollTopAfter)
          // return window scrollTop if
          setScrollPosition(window, windowScrollTopBefore)
          // add itemMiddle.top position
          setScrollPosition(this.scrollTarget, getScrollPosition(this.scrollTarget) - this.itemMiddle.top)
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
        setScrollPosition(this.scrollTarget, scrollPosition)
      }
      if (this.itemMiddle) {
        scrollWithScrollIntoView()
        this.$log('imsiv done')
      } else {
        this.$log('imsiv itemMiddle NOT FOUND, failed, go to TOP')
        setScrollPosition(this.scrollTarget, 0)
      }
    },
    itemMiddleHandler (isVisible, entry) {
      let [key, idxSting] = entry.target.accessKey.split('-')
      if (isVisible) {
        // this.$log('isVisible', entry.target.accessKey)
        // if (this.scrollHeightChanging) return
        // let [key, idxSting] = entry.target.accessKey.split('-')
        // this.$log('itemMiddle SET', idxSting)
        this.itemMiddleSet(key, parseInt(idxSting))
      } else {
        if (this.itemMiddle && this.itemMiddle.key === key) {
          // PPV Закомментил тк сначала приходит isVisible === false для старого элемента, а потом isVisible === true - для нового (а в промежуток вклинивается itemMiddleScrollIntoView(ей нужен itemMiddle(иначе она мотает к верху)))
          // this.$log('itemMiddle HIDE', this.itemMiddle.idx)
          // this.itemMiddle = null
        }
      }
    },
    itemMiddleSet (key, idx, useTop = true) {
      this.$log('ims', idx, useTop)
      if (key) {
        if (this.itemMiddlePersist) this.itemsRes.setProperty('currentId', key)
        let item = this.itemsRes.itemsHeaderFooter[idx]
        // this.$log('ims item.name', item?.name)
        let itemRef = this.$refs[`item-${key}`]
        if (itemRef && itemRef[0]) {
          itemRef = itemRef[0]
          this.itemMiddle = {
            key: key,
            idx: idx,
            name: item?.name,
            ref: itemRef,
            top: 0,
            item: item
          }
          this.itemMiddleTopUpdate()
        } else {
          this.$log('ims itemRef NOT FOUND', key, idx, item?.name)
        }
      } else {
        this.itemMiddle = null
      }
    },
    async positionStartHere (key, idx) {
      this.$log('positionStartHere', key, idx)
      this.itemMiddleSet(null)
      this.itemMiddleSet(key, idx)
      await this.itemsRes.gotoCurrent()
    },
    async positionDrop () {
      this.$log('positionDrop')
      this.itemMiddleSet(null)
      await this.itemsRes.gotoStart()
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
    },
    async next () {
      if (!this.itemsRes) return
      if (!this.itemsRes.hasNext) return
      if (this.itemsResStatus) return
      if (Date.now() - this.prevCompleteDt < 2000) return // PPV при попытке промотки вниз когда список закончился - скролл оттягивается вниз, а потом вверх и поэтому может сработать prev()
      this.$log('next', this.nextSize)
      this.itemsResStatus = 'NEXT'
      this.$log('next start')
      if (this.$store.state.ui.useDebug) {
        this.$q.notify({
          type: 'positive',
          message: 'Next !',
          position: 'bottom-right'
        })
      }
      await this.itemsRes.next(this.nextSize)
      this.$log('next done')
      this.itemsResStatus = null
      this.nextCompleteDt = Date.now()
    },
    scrollUpdate (e) {
      this.scrollTop = getScrollPosition(this.scrollTarget)
      this.updateShowHeader(this.scrollTop)
      this.scrollHeight = getScrollHeight(this.scrollTarget)
      this.scrollBottom = this.scrollHeight - this.scrollTargetHeight - this.scrollTop
    },
    scrollHeightResized (e) {
      this.$log('scrollHeightResized', e.height)
      if (!this.scrollTarget) return
      this.scrollTargetHeight = this.scrollTargetIsWindow ? this.scrollTarget.innerHeight : this.scrollTarget.clientHeight
      this.scrollTargetWidth = this.scrollTargetIsWindow ? this.scrollTarget.innerWidth : this.scrollTarget.clientWidth
      this.scrollHeight = e.height
      this.scrollUpdate()
    },
    updateShowHeader (scrollTop) {
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
        if (this.scrollState.showHeader) {
          this.scrollState.showHeader = false
          this.$emit('showHeader', this.scrollState.showHeader)
        }
      }

      // едем вверх более 1 сек и проехали более 200 px
      if ((scrollTop === 0) || (this.scrollState.direction === 'up' &&
          Date.now() - this.scrollState.startTm > minScrollDur &&
          Math.abs(this.scrollState.lastScrollTop - this.scrollState.startPos) > minScrollLen)) {
        if (!this.scrollState.showHeader) {
          this.scrollState.showHeader = true
          this.$emit('showHeader', this.scrollState.showHeader)
        }
      }
      // мы на самом верху
      if (scrollTop === 0) {
        this.scrollState.showHeader = true
      }
    }
  },
  mounted () {
    this.$log('mounted')
    // alert('scrollTargetIsWindow=' + this.scrollTargetIsWindow)
    this.scrollTarget = getScrollTarget(this.$el)
    // this.$log('this.scrollTarget', this.scrollTarget)
    this.scrollTarget.addEventListener('scroll', this.scrollUpdate)
    this.scrollTarget.addEventListener('resize', this.scrollHeightResized)
    this.scrollTargetHeight = this.scrollTargetIsWindow ? this.scrollTarget.innerHeight : this.scrollTarget.clientHeight
    this.scrollTargetWidth = this.scrollTargetIsWindow ? this.scrollTarget.innerWidth : this.scrollTarget.clientWidth
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    this.scrollTarget.removeEventListener('scroll', this.scrollUpdate)
    this.scrollTarget.removeEventListener('resize', this.scrollHeightResized)
  }
}
</script>
