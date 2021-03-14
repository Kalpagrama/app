<template lang="pug">
div(
  :style=`{
    //- paddingTop: '100px',
    //- paddingTop: scrollTargetHeight+'px',
    //- paddingBottom: scrollTargetHeight+'px',
  }`
  ).row.full-width.items-start.content-start
  q-resize-observer(@resize="scrollHeightResized")
  //- debug
  transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
    div(
      v-if="debugPosition"
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
            small.full-width itemsRes.items: {{ itemsRes.items.length }}
            small(v-if="itemMiddle").full-width itemMiddle.top: {{ itemMiddle.top }}
            q-btn(
              @click="prependShow = !prependShow"
              outline dense no-caps align="left" size="sm"
              :color="prependShow ? 'red' : 'white'"
              ).full-width.q-mb-xs {{ prependShow ? 'Hide prepend' : 'Show prepend' }}
            q-btn(
              @click="appendShow = !appendShow"
              outline dense no-caps  align="left" size="sm"
              :color="appendShow ? 'red' : 'white'"
              ).full-width.q-mb-xs {{ appendShow ? 'Hide append' : 'Show append' }}
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
  //- div(
    :style=`{
      height: '100px',
    }`
    ).row.full-width.bg-red
  div(
    v-if="prependShow"
    :style=`{
      height: '340px',
    }`
    ).row.full-width
  //- loading start, no itemsRes
  div(
    v-if="!itemsRes"
    :style=`{
      height: scrollTargetHeight/2+'px',
    }`
    ).row.full-width.items-center.content-center.justify-center
    q-spinner(size="50px" color="green")
  //- got itemsRes and some items
  div(
    v-if="itemsRes"
    ref="items-res-wrapper"
    :style=`{
      position: 'relative',
    }`
    ).row.full-width.items-start.content-start
    //- prev loading
    div(
      v-if="itemsResStatus === 'PREV'"
      :style=`{
        position: 'absolute', top: '0px', zIndex: 10000,
        height: '60px',
      }`
      ).row.full-width.items-center.content-center.justify-center
      q-spinner-dots(color="green" size="60px")
    //- item wrapper
    div(
      v-for="(item, itemIndex) in itemsRes.items"
      :key="item[itemKey]"
      :ref="`item-${item[itemKey]}`"
      :accessKey="`${item[itemKey]}-${itemIndex}`"
      :style=`{
        ...itemStyles,
      }`
      v-observe-visibility=`{
        throttle: 150,
        callback: itemMiddleHandler,
        intersection: {
          root: scrollTargetIsWindow ? null : scrollTarget,
          rootMargin: rootMargin
        }
      }`
      ).row.full-width
      //- item slot
      slot(
        name="item"
        :item="item"
        :itemIndex="itemIndex"
        :isActive="item[itemKey] === (itemMiddle ? itemMiddle.key : undefined)"
        :isVisible="true")
    //- next loading
    div(
      v-if="itemsResStatus === 'NEXT'"
      :style=`{
        position: 'absolute', bottom: '0px', zIndex: 10000,
        height: '60px',
      }`
      ).row.full-width.items-center.content-center.justify-center
      q-spinner-dots(color="green" size="60px")
  slot(name="append")
  div(
    v-if="appendShow"
    :style=`{
      height: '340px',
    }`
    ).row.full-width
</template>

<script>
import { scroll } from 'quasar'
const { getScrollTarget, getScrollPosition, setScrollPosition, getScrollHeight } = scroll
import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock'

export default {
  name: 'listFeed',
  props: {
    rootMargin: {type: String, default () { return '-50% 0px' }},
    // rootMargin: {type: String, default () { return '-40% 0px' }},
    query: {
      type: Object,
      required: true,
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
    itemsPerPage: {
      type: Number,
      default () {
        return 12
      }
    },
    itemsMax: {
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
      prependShow: false,
      appendShow: false,
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
      // items
      itemsRes: null,
      itemsResStatus: null,
      // item
      itemMiddle: null,
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
      }
      else {
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
        this.itemsRes = await this.$rxdb.find(to, true)
      }
    },
    'itemsRes.items': {
      async handler (to, from) {
        this.$log('itemsRes.items TO', to.length)
        this.itemMiddleScrollIntoView('itemsRes.items WATCHER')
        this.$nextTick(() => {
          this.$log('itemsRes.items $nextTick')
          if (!this.itemMiddle && this.itemsRes.getProperty('currentId')) {
            this.itemMiddleSet(this.itemsRes.getProperty('currentId'), 0, false)
          }
          this.itemMiddleScrollIntoView('itemsRes.items WATCHER $nextTick')
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
        // if (to < this.paginationBufferHeight) await this.prev()
        // if (this.scrollBottom < this.paginationBufferHeight) await this.next()
        // changing...
        this.scrollTopChanging = true
        this.scrollTopTimeout = setTimeout(async () => {
          // END of scrollTopChanging
          this.$log('scrollTop END')
          this.scrollTopChanging = false
          if (this.scrollTop < this.paginationBufferHeight) await this.prev()
          if (this.scrollBottom < this.paginationBufferHeight) await this.next()
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
          // handle prev..
          if (this.itemsRes && this.itemsRes.hasPrev && this.scrollTop < this.paginationBufferHeight) {
            // alert('Initial prev...')
            // this.prev()
          }
        }, 600)
      }
    },
  },
  methods: {
    itemMiddleGetPosition () {
      this.$log('itemMiddleGetPosition')
      if (!this.itemMiddle) return
      let itemMiddleOffsetTop = this.itemMiddle.ref.offsetTop
      let itemMiddleOffsetParent = this.itemMiddle.ref.offsetParent
      let itemMiddleRect = this.itemMiddle.ref.getBoundingClientRect()
      this.$log('itemMiddle', {itemMiddleOffsetTop, itemMiddleOffsetParent, itemMiddleRect})
      let itemsResWrapperRef = this.$refs['items-res-wrapper']
      let itemsResWrapperRect = itemsResWrapperRef.getBoundingClientRect()
      let itemsResWrapperOffsetTop = itemsResWrapperRef.offsetTop
      let itemsResWrapperOffsetParent = itemsResWrapperRef.offsetParent
      this.$log('itemsResWrapper', {itemsResWrapperRect, itemsResWrapperOffsetTop, itemsResWrapperOffsetParent})
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
        }
        else {
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
      }
      else {
        this.$log('imsiv itemMiddle NOT FOUND, failed, go to TOP')
        setScrollPosition(this.scrollTarget, 0)
      }
    },
    itemMiddleHandler (isVisible, entry) {
      if (isVisible) {
        // if (this.scrollHeightChanging) return
        let [key, idxSting] = entry.target.accessKey.split('-')
        this.itemMiddleSet(key, parseInt(idxSting))
      }
    },
    itemMiddleSet (key, idx, useTop = true) {
      this.$log('ims', key, idx, useTop)
      if (key) {
        if (this.itemMiddlePersist) this.itemsRes.setProperty('currentId', key)
        let item = this.itemsRes.items[idx]
        this.$log('ims item.name', item?.name)
        let itemRef = this.$refs[`item-${key}`]
        if (itemRef && itemRef[0]) {
          itemRef = itemRef[0]
          this.itemMiddle = {
            key: key,
            name: item?.name,
            ref: itemRef,
            top: 0,
            item: item
          }
          this.itemMiddleTopUpdate()
        }
        else {
          this.$log('ims itemRef NOT FOUND', key, idx, item?.name)
        }
      }
      else {
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
      this.$log('prev')
      if (!this.itemsRes) return
      if (!this.itemsRes.hasPrev) return
      if (this.itemsResStatus) return
      this.itemsResStatus = 'PREV'
      this.$log('prev start')
      // this.$q.notify({type: 'positive', message: 'Prev !', position: 'top'})
      await this.itemsRes.prev(this.itemsPerPage, this.itemsMax)
      this.$log('prev done')
      this.itemsResStatus = null
    },
    async next () {
      this.$log('next')
      if (!this.itemsRes) return
      if (!this.itemsRes.hasNext) return
      if (this.itemsResStatus) return
      this.itemsResStatus = 'NEXT'
      this.$log('next start')
      // this.$q.notify({type: 'positive', message: 'Next !', position: 'bottom'})
      await this.itemsRes.next(this.itemsPerPage, this.itemsMax)
      this.$log('next done')
      this.itemsResStatus = null
    },
    scrollUpdate (e) {
      this.scrollTop = getScrollPosition(this.scrollTarget)
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
    }
  },
  mounted () {
    this.$log('mounted')
    this.scrollTarget = getScrollTarget(this.$el)
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
