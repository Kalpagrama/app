<template lang="pug">
div(
  :style=`{
  }`
  ).row.full-width.items-start.content-start
  q-resize-observer(@resize="scrollHeightResized")
  //- debug
  //- div(
    :style=`{
      //- position: scrollTargetIsWindow ? 'fixed' : 'absolute',
      position: 'fixed',
      zIndex: 1000, top: '0px',
      opacity: 0.6,
    }`
    ).row.bg-green.text-white.q-pa-sm
    small.full-width scrollTargetIsWindow: {{ scrollTargetIsWindow }}
    small.full-width scrollTargetHeight: {{ scrollTargetHeight }}
    small.full-width scrollTop: {{ scrollTop }}
    small.full-width scrollBottom: {{ scrollBottom }}
    small.full-width scrollHeight: {{ scrollHeight }}
    small(v-if="itemsRes").full-width itemsRes.items: {{ itemsRes.items.length }}
    div(v-if="itemMiddle").row.full-width
      small.full-width itemMiddle.top: {{ itemMiddle.top }}
    small(:class=`{'text-red': scrollTopChanging}`).full-width scrollTopChanging: {{ scrollTopChanging }}
    small(:class=`{'text-red': scrollHeightChanging}`).full-width scrollHeightChanging: {{ scrollHeightChanging }}
    .row.full-width
      q-btn(flat dense color="white" no-caps @click="prev()") Prev
      q-btn(flat dense color="red" no-caps @click="next()") Next
      q-btn(flat dense color="orange" no-caps @click="positionDrop()") To start!
      q-btn(flat dense color="blue" no-caps @click="positionStartHere()") Start here!
      q-btn(flat dense color="white" no-caps @click="showHeader = !showHeader") {{showHeader ? 'Hide header' : 'Show header'}}
  //- loading start, no itemsRes
  div(
    v-if="!itemsRes"
    :style=`{
      height: scrollTargetHeight+'px',
    }`
    ).row.full-width.items-center.content-center.justify-center
    q-spinner(size="50px" color="green")
  //- header
  //- div(
    v-if="showHeader"
    :style=`{
      height: '240px',
    }`
    ).row.full-width.items-center.content-center.justify-center.bg-red
    h1.text-white HEADER
  slot(name="prepend")
  //- got itemsRes and some items
  div(
    v-if="itemsRes"
    :style=`{
    }`
    ).row.full-width.items-start.content-start
    //- item wrapper
    div(
      v-for="(item, itemIndex) in itemsRes.items"
      :key="item[itemKey]"
      :ref="`item-${item[itemKey]}`"
      :accessKey="`${item[itemKey]}-${itemIndex}`"
      :style=`{
        ...itemStyles,
        //- paddingBottom: '50px',
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
  slot(name="append")
</template>

<script>
import { scroll } from 'quasar'
const { getScrollTarget, getScrollPosition, setScrollPosition, getScrollHeight } = scroll

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
    }
  },
  data () {
    return {
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
    itemKey () {
      return this.itemsRes?.itemPrimaryKey
    },
    scrollTargetIsWindow () {
      return this.scrollTarget === window
    },
    paginationBufferHeight () {
      // return this.scrollTargetHeight * 2
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
        this.$nextTick(() => {
          this.$log('itemsRes.items $nextTick')
          if (!this.itemMiddle && this.itemsRes.getProperty('currentId')) {
            this.itemMiddleSet(this.itemsRes.getProperty('currentId'), 0, false)
          }
          this.itemMiddleScrollIntoView()
        })
      }
    },
    '$store.state.ui.listFeedNeedDrop': {
      deep: true,
      handler (to, from) {
        this.$log('$store.state.ui.listFeedNeedDrop TO', to)
        if (to) {
          this.positionDrop()
          this.$store.commit('ui/stateSet', ['listFeedNeedDrop', false])
        }
      }
    },
    scrollTop: {
      async handler (to, from) {
        // this.$log('scrollTop To/From:', to, from)

        // update itemMiddle.top position
        if (this.itemMiddle) {
          let top = this.itemMiddle.ref.getBoundingClientRect().top
          if (!this.scrollTargetIsWindow) top -= this.scrollTarget.getBoundingClientRect().top
          this.itemMiddle.top = top
        }

        // wait for the end
        if (this.scrollTopTimeout) {
          clearTimeout(this.scrollTopTimeout)
          this.scrollTopTimeout = null
        }
        if (!this.scrollTopChanging) this.$log('scrollTop START')
        this.scrollTopChanging = true
        this.scrollTopTimeout = setTimeout(async () => {
          this.scrollTopChanging = false

          // END of scrollTopChanging
          this.$log('scrollTop END')
          if (this.scrollTop < this.paginationBufferHeight) await this.prev()
          if (this.scrollBottom < this.paginationBufferHeight) await this.next()
        }, 600)
      }
    },
    scrollHeight: {
      async handler (to, from) {
        // this.$log('scrollHeight To/From:', to, from)

        // wait for the end
        if (this.scrollHeightTimeout) {
          clearTimeout(this.scrollHeightTimeout)
          this.scrollHeightTimeout = null
        }
        if (!this.scrollHeightChanging) this.$log('scrollHeight START')
        this.scrollHeightChanging = true
        this.scrollHeightTimeout = setTimeout(() => {
          this.scrollHeightChanging = false

          // END of scrollHeightChanging
          this.$log('scrollHeight END')
          this.itemMiddleScrollIntoView()
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
    itemMiddleScrollIntoView () {
      this.$log('imsiv start')
      if (this.itemMiddle) {
        this.$log('imsiv ref', this.itemMiddle.ref)
        let top = this.itemMiddle.top
        // this.itemMiddle.ref.scrollIntoView()
        // setScrollPosition(this.scrollTarget, getScrollPosition(this.scrollTarget) - top)
        let offsetTop = this.itemMiddle.ref.offsetTop
        this.$log('imsiv offsetTop', offsetTop)
        let offsetTopScrollTarget = this.scrollTargetIsWindow ? 0 : this.scrollTarget.offsetTop
        this.$log('imsiv offsetTopScrollTarget', offsetTopScrollTarget)
        setScrollPosition(this.scrollTarget, offsetTop - offsetTopScrollTarget - top)
        this.$log('imsiv done')
      }
      else {
        this.$log('imsiv itemMiddle NOT FOUND, failed, go to TOP')
        setScrollPosition(this.scrollTarget, 0)
      }
    },
    itemMiddleHandler (isVisible, entry) {
      if (isVisible) {
        if (this.scrollHeightChanging) return
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
          let top = itemRef.getBoundingClientRect().top
          if (!this.scrollTargetIsWindow) top -= this.scrollTarget.getBoundingClientRect().top
          this.itemMiddle = {
            key: key,
            name: item?.name,
            ref: itemRef,
            top: top,
            item: item
          }
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
      this.itemMiddleSet(null)
      await this.itemsRes.gotoStart()
    },
    async prev () {
      this.$log('prev')
      if (!this.itemsRes) return
      if (!this.itemsRes.hasPrev) return
      if (this.itemsResStatus) return
      this.itemsResStatus = 'PREV'
      this.$log('prev start')
      // this.$q.notify({type: 'positive', message: 'Prev !', position: 'top'})
      await this.itemsRes.prev()
      this.$log('prev done')
      this.itemsResStatus = null
    },
    async next () {
      this.$log('next')
      if (!this.itemsRes) return
      if (!this.itemsRes.hasPrev) return
      if (this.itemsResStatus) return
      this.itemsResStatus = 'NEXT'
      this.$log('next start')
      // this.$q.notify({type: 'positive', message: 'Next !', position: 'bottom'})
      await this.itemsRes.next()
      this.$log('next done')
      this.itemsResStatus = null
    },
    scrollUpdate (e) {
      this.scrollTop = getScrollPosition(this.scrollTarget)
      this.scrollHeight = getScrollHeight(this.scrollTarget)
      this.scrollBottom = this.scrollHeight - this.scrollTargetHeight - this.scrollTop
      // if (this.itemMiddle) {
      //   this.$log('itemMiddle.ref.offsetTop 1', this.itemMiddle.ref.offsetTop)
      //   this.$log('itemMiddle.ref.offsetTop 2', this.$refs['item-' + this.itemMiddle.key][0].offsetTop)
      // }
    },
    scrollHeightResized (e) {
      this.$log('scrollHeightResized', e.height)
      if (!this.scrollTarget) return
      this.scrollTargetHeight = this.scrollTargetIsWindow ? this.scrollTarget.innerHeight : this.scrollTarget.clientHeight
      this.scrollTargetWidth = this.scrollTargetIsWindow ? this.scrollTarget.innerWidth : this.scrollTarget.clientWidth
      this.scrollHeight = e.height
      this.scrollUpdate()
      // this.scrollTargetHeight = e.height
      // this.scrollTargetWidth = e.width
    }
  },
  mounted () {
    this.$log('mounted')
    this.scrollTarget = getScrollTarget(this.$el)
    this.scrollTarget.addEventListener('scroll', this.scrollUpdate)
    this.scrollTarget.addEventListener('resize', this.scrollHeightResized)
    this.scrollTargetHeight = this.scrollTargetIsWindow ? this.scrollTarget.innerHeight : this.scrollTarget.clientHeight
    this.scrollTargetWidth = this.scrollTargetIsWindow ? this.scrollTarget.innerWidth : this.scrollTarget.clientWidth
    // this.$nextTick(() => {
    //   this.scrollUpdate()
    //   this.scrollResized()
    // })
    // this.$wait(1000).then(() => {
    //   this.scrollUpdate()
    //   this.prev()
    // })
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    this.scrollTarget.removeEventListener('scroll', this.scrollUpdate)
    this.scrollTarget.removeEventListener('resize', this.scrollHeightResized)
  }
}
</script>
