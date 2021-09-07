// если указан scrollAreaHeight - сделает внутренний скролл - иначе - воспользуется скроллом window
<template lang="pug">
  div(:style=`{maxHeight: scrollAreaHeight+'px', height: scrollAreaHeight+'px'}` :class=`{ scroll: !!scrollAreaHeight}`).row.full-width.items-start.content-start
    div(ref="scrolledItems").row.full-width
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
                small.full-width scrollTop: {{ scrollTop }}
                small.full-width scrollBottom: {{ scrollBottom }}
                small.full-width scrollHeight: {{ scrollHeight }}
                small.full-width itemsRes.itemsHeaderFooter: {{ itemsRes.itemsHeaderFooter.length }}
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
      slot(name="prepend")
      //- spinner, no itemsRes
      //div(v-if="!itemsRes"  :style=`{position: 'absolute', zIndex: 'auto', top: '50%', left: '50%'}`)
      q-spinner-dots(v-if="!itemsRes" color="green" size="60px").absolute-center
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
            :style=`{...itemStyles}`
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
            span(v-if="$store.state.ui.useDebug" :dimmed="!!itemsVisibility[item[itemKey]]" :style=`{color: itemMiddle && itemMiddle.key === item[itemKey] ? 'green' : 'white'}`
            ) # {{itemIndex-1}} of {{itemsRes.itemsHeaderFooter.length-2}} orig# {{item.debugInfo().indxHF }} of {{item.debugInfo().loadedLen}} {{item[itemKey]}} {{!!itemsVisibility[item[itemKey]] ? '-----VISIBLE' : ''}}
            slot(
              name="item"
              :item="item"
              :itemIndex="itemIndex"
              :isActive="item[itemKey] === (itemMiddle ? itemMiddle.key : undefined)"
              :isVisible="!!itemsVisibility[item[itemKey]]")
      slot(name="append")
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
      // scrollBottom
      scrollBottom: 0,
      // scrollHeight
      scrollHeight: 0,
      itemsRes: null,
      itemsResStatus: null,
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
      if (this.scrollHeight >= this.scrollTargetHeight) return '-50% 0px'
      else { // скролл не заполнен
        return `-${Math.ceil(50 * (this.scrollHeight / this.scrollTargetHeight))}% 0px`
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
      return this.itemsRes ? this.itemsRes.itemsHeaderFooter.length : 0
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
        this.$log('itemsRes.itemsHeaderFooter:', to.length, this.itemsRes.getProperty('currentId'))
        // удаляем те, которых нет в новом списке
        for (let itemMiddle of this.itemMiddleHistory) {
          itemMiddle.item = this.itemsRes.itemsHeaderFooter.find(item => item[this.itemKey] === itemMiddle.key)
          // this.$log('ims item.name', item?.name)
          let itemRef = this.$refs[`item-${itemMiddle.key}`]
          if (itemRef) itemMiddle.ref = itemRef[0]
        }
        this.itemMiddleHistory.splice(0, this.itemMiddleHistory.length, ...this.itemMiddleHistory.filter(im => !!im.item && !!im.ref)) // удаляем те, которых нет в новом списке
        this.itemMiddleTopUpdate()
        this.itemMiddleScrollIntoView('itemsRes.itemsHeaderFooter WATCHER')
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
    // watch it to drop position, and scrollToTop
    '$store.state.ui.listFeedGoToStart': {
      deep: true,
      // immediate: true,
      async handler (to, from) {
        this.$log('$store.state.ui.listFeedGoToStart TO', to)
        if (to) {
          this.$store.commit('ui/stateSet', ['listFeedGoToStart', false])
          await this.gotoStart()
        }
      }
    },
    scrollHeight: {
      async handler (to, from) {
        // this.$log(`scrollHeight ${from}->${to}`)
        this.itemMiddleScrollIntoView('scrollHeight IN')
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
      if (this.itemMiddle) this.$log('itemMiddle.item.debugInfo()', this.itemMiddle.item.debugInfo())
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
        this.itemMiddleSet(key, parseInt(idxSting))
      } else {
        if (this.itemMiddle && this.itemMiddle.key === key) {
          // PPV Закомментил тк сначала приходит isVisible === false для старого элемента, а потом isVisible === true - для нового (а в промежуток вклинивается itemMiddleScrollIntoView(ей нужен itemMiddle(иначе она мотает к верху)))
          // this.$log('itemMiddle HIDE', this.itemMiddle.idx)
          // this.itemMiddle = null
        }
      }
    },
    itemVisibilityHandler (isVisible, entry) {
      let [key, idxSting] = entry.target.accessKey.split('-')
      // this.$log('itemVisibilityChanged', isVisible, idxSting, key)
      this.$set(this.itemsVisibility, key, isVisible)
    },
    itemMiddleSet (key, idx) {
      this.$log('ims', idx)
      assert(key && idx && idx >= 0)
      if (key.in('header', 'footer')) return
      if (this.itemMiddlePersist) this.itemsRes.setProperty('currentId', key)
      let item = this.itemsRes.itemsHeaderFooter[idx]
      // this.$log('ims item.name', item?.name)
      let itemRef = this.$refs[`item-${key}`]
      if (itemRef && itemRef[0]) {
        itemRef = itemRef[0]
        this.itemMiddle = {
          key: key,
          // idx: idx -  можем и запоминать, но тогда надо будет синхронищировать в вотчере при изменении itemsRes
          ref: itemRef,
          item: item,
          name: item?.name,
          top: 0
        }
        this.itemMiddleTopUpdate()
      } else {
        this.$logE('ims itemRef NOT FOUND', key, idx, item?.name, this.itemsRes)
      }
    },
    async fillMore() {
      if (this.scrollTop < this.paginationBufferHeight) await this.prev()
      else if (this.scrollBottom < this.paginationBufferHeight) await this.next()
    },
    async gotoCurrent () {
      this.$log('gotoCurrent')
      this.itemMiddleHistory.splice(0, this.itemMiddleHistory.length)
      await this.itemsRes.gotoCurrent()
    },
    async gotoStart () {
      this.$log('gotoStart')
      this.itemMiddleHistory.splice(0, this.itemMiddleHistory.length)
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
      // this.$logW('scrollUpdate', e)
      this.scrollHeight = this.$refs.scrolledItems.clientHeight // обновится чуть позже в scrollHeightResized (а сейчас scrollHeight - в неактуальном состоянии. берем актуальные данные)
      this.scrollTop = getScrollPosition(this.scrollTarget)
      this.scrollBottom = this.scrollHeight - this.scrollTargetHeight - this.scrollTop
      this.updateShowHeader(this.scrollTop)
    },
    scrollHeightResized (e) {
      // this.$logW('scrollHeightResized', e.height)
      this.scrollHeight = e.height
      if (!this.scrollTarget) return
      this.scrollTargetHeight = this.scrollTargetIsWindow ? this.scrollTarget.innerHeight : this.scrollTarget.clientHeight
      this.scrollTargetWidth = this.scrollTargetIsWindow ? this.scrollTarget.innerWidth : this.scrollTarget.clientWidth
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
