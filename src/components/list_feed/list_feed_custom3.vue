// если указан scrollAreaHeight - сделает внутренний скролл - иначе - воспользуется скроллом window
<template lang="pug">
  div(
    :style=`{maxHeight: scrollAreaHeight ? scrollAreaHeight+'px' : null, height: scrollAreaHeight ? scrollAreaHeight+'px' : null }`
    :class=`{ scroll: !!scrollAreaHeight}`).row.full-width.items-start.content-start
    div(ref="scrolledArea").row.full-width
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
                small.full-width scrollTargetHeight: {{ scrollTargetHeight }}
                small.full-width scrollTop: {{ scrollTop }}
                small.full-width scrollBottom: {{ scrollBottom }}
                small.full-width scrolledAreaHeight: {{ scrolledAreaHeight }}
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
      // items
      div(v-for="({source: item, state, debugInfo}, itemIndex) in vsItems"
        :ref="`item-${itemIndex}`"
        :key="`item-${itemIndex}`"
        :accessKey="`${itemIndex}`"
        v-observe-visibility=`{
          throttle: 0,
          callback: itemActiveHandler,
          intersection: {
            root: scrollTargetIsWindow ? null : scrollTarget,
            rootMargin: rootMargin,
            //- threshold: 0.9,
          }
        }`
        :style=`{position: 'relative'}`
      ).row.full-width
        // болванка (должна быть минимальной. их создается очень(очень) много)
        div(v-if="state.isDummy"
          :style=`{
               height: state.height + 'px',
               border: '2px solid rgb(50,50,50)',
               borderRadius: '10px',
         }`).row.full-width.q-mb-xl
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
               threshold: 0.2},
            }`
        ).row.full-width
          q-resize-observer(@resize="itemResized(itemIndex, $event.height)")
          slot(
            name="item"
            :item="item"
            :itemState="state"
            :itemIndex="itemIndex"
            :isActive="itemActive && itemActive.indx === itemIndex"
            :isVisible="!!itemsVisibility[item[itemKey]]",
            :isPreload="true"
          )
        span(v-if="$store.state.ui.useDebug" :style=`{color: itemActive && itemIndex === itemActive.indx ? 'green' : 'grey'}`
        ).absolute-top # {{itemIndex}} of {{length}}
</template>

<script>
import { scroll } from 'quasar'
import { LstCollectionEnum, WsCollectionEnum } from 'src/system/rxdb/common'
import { assert } from 'src/system/common/utils'

const { getScrollTarget, getScrollPosition, setScrollPosition, getScrollHeight } = scroll
// import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock'

export default {
  name: 'listFeedCustom',
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
      scrollTargetHeight: 0,
      // scrollTop
      scrollTop: 0, // расстояние от начала скроллируемого списка до первого видимого пикселя
      // scrollBottom
      scrollBottom: 0, // расстояние от конца скроллируемого списка до последнего видлимого пикселя
      // scrolledAreaHeight
      scrolledAreaHeight: 0,
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
      if (this.scrolledAreaHeight >= this.scrollTargetHeight) return '-50% 0px'
      else { // скролл не заполнен
        return `-${Math.ceil(50 * (this.scrolledAreaHeight / this.scrollTargetHeight))}% 0px`
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
        this.itemsRes = await this.$rxdb.find(to, 100500, 100500 * 100500)
      }
    },
    'itemsRes.items': {
      async handler (to, from) {
        this.$log('itemsRes.items:', to.length, this.itemsRes.getProperty('itemActiveIndx'))
        this.vsItems = this.vsItems = this.itemsRes.items.map(item => {
          return {
            debugInfo: item.debugInfo,
            source: item.populatedObject || item,
            state: {
              itemId: item[this.itemKey],
              isDummy: true,
              height: this.itemHeightApprox,
              heightPrev: 0
            }
          }
        }) || []
        // this.$log('vsitems=', this.vsItems)
        this.$nextTick(() => {
          this.$log('itemsRes.items $nextTick')
          if (!this.itemActive) {
            let ref = this.$refs[`item-${this.itemsRes.getProperty('itemActiveIndx')}`]
            if (ref) {
              ref = ref[0]
              ref.scrollIntoView()
              this.$nextTick(() => {
                let itemTopOffset = this.scrollTargetHeight / 2 - ref.clientHeight / 2
                this.$log('itemTopOffset=', itemTopOffset)
                setScrollPosition(this.scrollTarget, getScrollPosition(this.scrollTarget) - itemTopOffset) // перемещаем элемент в центр видимой области
                this.itemActiveSet(this.itemsRes.getProperty('itemActiveIndx'))
              })
            }
          }
        })
        this.$emit('count', to.length - 2)
      }
    },
    'itemActive.indx': {
      async handler (to, from) {
        const itemPerScreenCnt = Math.ceil(this.scrollTargetHeight / this.itemHeightApprox)
        // this.$log(`itemActive.indx: ${from}->${to} itemPerScreenCnt=${itemPerScreenCnt}`, this.vsItems)
        for (let indx = 0; indx <= this.length; indx++){
          // "isDummy = true" делается на большем расстоянии чтобы не было рекурсивного зацикливания (смена isDummy может привести к смене itemActive)
          if (indx < to - itemPerScreenCnt * 5 || indx > to + itemPerScreenCnt * 5) this.vsItems[indx].state.isDummy = true
          if (indx >= to - itemPerScreenCnt * 3 && indx <= to + itemPerScreenCnt * 3) this.vsItems[indx].state.isDummy = false
        }
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
    scrolledAreaHeight: {
      async handler (to, from) {
        // this.$log(`scrolledAreaHeight ${from}->${to}`)
        // this.itemActiveScrollIntoView('scrolledAreaHeight IN')
      }
    },
    scrollTop: {
      async handler (to, from) {
        // this.$logW(`scrollTop ${from}->${to}`)
        // update itemActive.top position
        this.itemActiveTopUpdate()
      }
    },
  },
  methods: {
    itemResized (indx, height) {
      assert(this.vsItems[indx])
      this.vsItems[indx].state.heightPrev = this.vsItems[indx].state.height
      this.vsItems[indx].state.height = height
      if (this.itemActive && indx < this.itemActive.indx) {
        // let delta = this.vsItems[indx].state.height - this.vsItems[indx].state.heightPrev
        // this.$log('itemResized', {
        //   indx,
        //   from: this.vsItems[indx].state.heightPrev,
        //   to: this.vsItems[indx].state.height,
        //   active: this.itemActive.indx
        // })
        // setScrollPosition(this.scrollTarget, getScrollPosition(this.scrollTarget) - delta)
        this.itemActiveScrollIntoView('itemResized')
      }
    },
    itemActiveTopUpdate () {
      if (this.itemActive) {
        let top = this.itemActive.ref.getBoundingClientRect().top
        // assert(top <= this.scrollTargetHeight, 'top - это смещение элемента на видимой части экрана')
        if (!this.scrollTargetIsWindow) top -= this.scrollTarget.getBoundingClientRect().top
        this.itemActive.top = top
      }
    },
    // подмотает скролл к itemActive.top
    itemActiveScrollIntoView (from) {
      this.$log('siv start', from)
      const scrollWithScrollIntoView = async () => {
        if (this.scrollTargetIsWindow) {
          // // just scroll to item
          this.itemActive.ref.scrollIntoView()
          // add itemActive.top position
          let top = this.itemActive.top
          // top - это смещение элемента на видимой части экрана(иногда может происходить что активный элемент находится вне экрана)). корректируем
          if (top >= this.scrollTargetHeight) top = Math.floor(this.scrollTargetHeight / 4)
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
        this.$log('siv offsetTop', offsetTop)
        let offsetTopScrollTarget = this.scrollTargetIsWindow ? 0 : this.scrollTarget.offsetTop
        this.$log('siv offsetTopScrollTarget', offsetTopScrollTarget)
        let top = this.itemActive.top
        this.$log('siv top', top)
        let scrollPosition = offsetTop - offsetTopScrollTarget - top
        this.$log('siv scrollPosition', scrollPosition)
        setScrollPosition(this.scrollTarget, scrollPosition)
      }
      if (this.itemActive) {
        this.$log('siv this.itemActive.top=', this.itemActive.top)
        scrollWithScrollIntoView()
        this.$log('siv done')
      } else {
        this.$log('siv itemActive NOT FOUND, failed, go to TOP')
        setScrollPosition(this.scrollTarget, 0)
      }
    },
    itemActiveHandler (isVisible, entry) {
      // let [key, idxSting] = entry.target.accessKey.split('-')
      if (isVisible) {
        this.$log('itemActiveHandler', entry.target.accessKey)
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
      let item = this.vsItems[indx]
      assert(itemRef && itemRef[0])
      assert(item)
      itemRef = itemRef[0]
      this.itemActive = {
        indx: indx,
        ref: itemRef,
        item: item,
        name: item.name,
        top: 0
      }
      this.itemActiveTopUpdate()
      this.$emit('progress', indx / this.length)
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
    scrollUpdate (e) {
      if (this.scrollTarget?.document?.activeElement?.className?.includes('q-body--prevent-scroll')) return // поверх списка показали диалог не нужно обновлять scrollTop(иначе улетит вверх)
      this.scrolledAreaHeight = this.$refs.scrolledArea.clientHeight // обновится чуть позже в scrolledAreaResized (а сейчас scrolledAreaHeight - в неактуальном состоянии. берем актуальные данные)
      this.scrollTop = getScrollPosition(this.scrollTarget)
      this.scrollBottom = this.scrolledAreaHeight - this.scrollTargetHeight - this.scrollTop
    },
    scrolledAreaResized (e) {
      // this.$logW('scrolledAreaResized', e.height, this.scrollTarget ? getScrollHeight(this.scrollTarget) : '---', this.$refs.scrolledArea.clientHeight)
      this.scrolledAreaHeight = this.$refs.scrolledArea.clientHeight
      if (!this.scrollTarget) return
      this.scrollTargetHeight = this.scrollTargetIsWindow ? this.scrollTarget.innerHeight : this.scrollTarget.clientHeight
      this.scrollUpdate()
    }
  },
  mounted () {
    this.$log('mounted')
    this.scrollTarget = getScrollTarget(this.$el)
    // this.$log('this.scrollTarget', this.scrollTarget)
    this.scrollTarget.addEventListener('scroll', this.scrollUpdate)
    this.scrollTarget.addEventListener('resize', this.scrolledAreaResized)
    this.scrollTargetHeight = this.scrollTargetIsWindow ? this.scrollTarget.innerHeight : this.scrollTarget.clientHeight
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    this.scrollTarget.removeEventListener('scroll', this.scrollUpdate)
    this.scrollTarget.removeEventListener('resize', this.scrolledAreaResized)
  }
}
</script>
