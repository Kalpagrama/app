<template lang="pug">
div(
  :style=`{
  }`
  ).row.full-width
  //- debug top
  div(:style=`{position: 'fixed', zIndex: 999999, right: '0px', top: '30%',maxWidth: '200px',opacity: 0.8}`).row.bg-green.text-white.q-pa-xs
    .row.full-width
      small.full-width scrollTop: {{scrollTop}}
      small.full-width scrollHeight: {{scrollHeight}}
      small.full-width scrollPaginationOffset: {{scrollPaginationOffset}}
      small.full-width itemMiddle.top: {{ itemMiddle ? itemMiddle.top : 0 }}
    .row.full-width
      q-btn(outline color="white" dense no-caps @click="positionDrop()") Go to start
      q-btn(outline color="white" dense no-caps @click="prev()") Prev
      q-btn(outline color="white" dense no-caps @click="next()") Next
      q-btn(outline color="white" dense no-caps @click="positionHere()") Here
      q-btn(outline color="white" dense no-caps @click="positionDebug()") Cofee
  //- loading spinner state
  div(
    v-if="scrollTarget && !itemsRes"
    :style=`{
      paddingTop: ((scrollTarget.clientHeight || scrollTarget.innerHeight)/2)-25+'px',
    }`
    ).row.full-width.justify-center
    q-spinner(size="50px" color="green")
  //- wrapper
  div(
    v-if="itemsRes"
    :style=`{
      position: 'relative',
    }`
    ).row.full-width.items-start.content-start
    //- prepend slot
    slot(name="prepend")
    //- prev loading
    div(
      v-if="itemsPreving"
      :style=`{
        position: 'absolute', top: '0px', zIndex: 10000,
        height: '60px',
      }`
      ).row.full-width.items-center.content-center.justify-center
      q-spinner-dots(color="green" size="50px")
    //- wrapper item
    div(
      v-for="(item, itemIndex) in itemsRes.items" :key="item[itemKey]"
      :ref="`item-${item[itemKey]}`"
      :accessKey="item[itemKey]"
      :style=`{
        ...itemStyles,
      }`
      v-observe-visibility=`{
        throttle: 300,
        callback: itemMiddleHandler,
        intersection: {
          root: scrollTarget ? scrollTarget.clientHeight ? scrollTarget : null : null,
          rootMargin: rootMargin
        }
      }`
      ).row.full-width.items-start.content-start
      slot(
        name="item"
        :item="item"
        :itemIndex="itemIndex"
        :isActive="item[itemKey] === itemMiddleKey"
        :isVisible="true")
    //- next loading
    div(
      v-if="itemsNexting"
      :style=`{
        position: 'absolute', bottom: '0px', zIndex: 10000,
        height: '60px',
      }`
      ).row.full-width.items-center.content-center.justify-center
      q-spinner-dots(color="green" size="50px")
    //- append slot
    slot(name="append")
</template>

<script>
import { scroll } from 'quasar'
import { RxCollectionEnum } from 'src/system/rxdb'
const { getScrollTarget, getScrollPosition, setScrollPosition, getScrollHeight } = scroll

export default {
  name: 'listFeed',
  props: {
    rootMargin: {type: String, default () { return '-50% 0px' }},
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
    positionSaving: {
      type: Boolean,
      default () {
        return true
      }
    }
  },
  data () {
    return {
      // item middle
      itemMiddle: null,
      itemMiddleRef: null,
      itemMiddleRect: null,
      itemMiddleKey: null,
      itemMiddleHandlerCount: 0,
      // items
      itemsRes: null,
      itemsResInited: false,
      // prev, next
      itemsPreving: false,
      itemsNexting: false,
      // scroll data
      scrollTop: 0,
      scrollHeight: 0,
      scrollTarget: null,
    }
  },
  computed: {
    itemKey () {
      return this.itemsRes ? this.itemsRes.itemPrimaryKey : null
    },
    scrollTargetHeight () {
      return this.scrollTarget ? (this.scrollTarget.clientHeight || this.scrollTarget.innerHeight) : this.$q.screen.height
    },
    scrollPaginationOffset () {
      // return this.scrollTargetHeight
      return this.scrollTargetHeight * 2
    }
  },
  watch: {
    query: {
      immediate: true,
      async handler (to, from) {
        this.$log('query TO')
        if (this.itemsRes) {
          this.positionDrop()
          this.itemsRes = null
        }
        this.itemsRes = await this.$rxdb.find(to, true)
        this.itemMiddle = this.itemsRes.getProperty('itemMiddle')
        this.$log('===== itemsRes created')
      }
    },
    'itemsRes.items': {
      async handler (to, from) {
        this.$log('§§§§§ itemsRes.items', to ? to.length : 0, from ? from.length : 0)
        if (this.itemsResInited) {
          this.scrollPreserve()
        }
        else {
          this.$emit('ready')
          // this.$nextTick(() => {
          //   this.prev()
          // })
        }
        // first load done
        this.itemsResInited = true
      }
    },
    scrollTop: {
      // immediate: true,
      async handler (to, from) {
        if (!this.itemsRes) return
        if (this.scrollHeight - to < this.scrollPaginationOffset) await this.next()
        if (to < this.scrollPaginationOffset) await this.prev()
        let scrollDelta = to - from
        // this.$log('scrollDelta', scrollDelta)
        if (this.itemMiddle) {
          if (Math.abs(scrollDelta) > 100) return
          this.itemMiddle.top -= scrollDelta
        }
      }
    },
    scrollHeight: {
      handler (to, from) {
        this.$log('scrollHeight TO', to)
      }
    },
    '$store.state.ui.listFeedNeedDrop': {
      handler (to, from) {
        this.$log('$store.state.ui.listFeedNeedDrop TO', to)
        if (to) {
          this.positionDrop()
          this.$store.commit('ui/stateSet', ['listFeedNeedDrop', false])
        }
      }
    },
    // 'itemMiddle.top': {
    //   handler (to, from) {
    //     this.$log('itemMiddle.top TO/from', to, from)
    //   }
    // }
  },
  methods: {
    async scrollPreserve () {
      this.$log('***** scrollPreserve start')
      if (!this.itemMiddleRef) return
      // if (this.itemsPreving || this.itemsNexting) return
      let scrollDelta = this.itemMiddle ? this.itemMiddle.top : 0
      this.$log('scrollPreserve scrollDelta', scrollDelta)
      this.$nextTick(async () => {
        this.$log('scrollPreserve nextTick')
        // let scrollPosition = this.itemMiddleRef.offsetTop
        let scrollPosition = this.itemMiddleRef.offsetTop - scrollDelta
        setScrollPosition(this.scrollTarget, scrollPosition)
        this.$log('***** scrollPreserve done')
      })
    },
    async prev () {
      if (this.itemsRes && this.itemsRes.hasPrev && !this.itemsPreving) {
        if (this.itemsNexting) return
        this.$log('----- prev prev prev')
        this.itemsPreving = true
        await this.itemsRes.prev()
        await this.$wait(300)
        this.itemsPreving = false
      }
    },
    async next () {
      if (this.itemsRes && this.itemsRes.hasNext && !this.itemsNexting) {
        if (this.itemsPreving) return
        this.$log('----- next next next')
        this.itemsNexting = true
        await this.itemsRes.next()
        await this.$wait(300)
        this.itemsNexting = false
      }
    },
    positionHere (key) {
      this.$log('positionHere')
      // this.itemsRes.setProperty('currentId', key)
      this.positionSave(this.itemMiddleKey)
      this.itemsRes.gotoCurrent()
    },
    positionDebug (key) {
      this.itemsRes.setProperty('currentId', '142363647983880232')
      this.itemsRes.gotoCurrent()
    },
    itemMiddleHandler (isVisible, entry, i) {
      if (!this.positionSaving) return
      // if (this.itemMiddleHandlerCount === 0 && this.itemMiddle && this.itemMiddle.key !== entry.target.accessKey) {
      //   alert('Dont save...')
      //   return
      // }
      // this.itemMiddleHandlerCount += 1
      if (isVisible) {
        this.positionSave(entry.target.accessKey)
      }
      else {
      }
      // TODO: handle -1
    },
    positionSave (key) {
      let objIndx = this.itemsRes.items.findIndex(item => item[this.itemsRes.itemPrimaryKey] === key)
      this.$log('positionSave', objIndx, objIndx >= 0 ? this.itemsRes.items[objIndx].name : 'not found', key)
      this.itemMiddleKey = key
      this.itemMiddleRef = this.$refs[`item-${key}`][0]
      this.itemMetaLifeTime = Date.now()
      this.itemMetaLifeScroll = getScrollPosition(this.scrollTarget)
      if (!this.itemMiddleRef) return
      this.itemMiddleRect = this.itemMiddleRef.getBoundingClientRect()
      this.itemMiddle = {
        key: key,
        // dimensions
        top: this.itemMiddleRect.top,
        bottom: this.itemMiddleRect.bottom,
        left: this.itemMiddleRect.left,
        right: this.itemMiddleRect.right,
        width: this.itemMiddleRect.width,
        height: this.itemMiddleRect.height,
        // scroll data
        offsetTop: this.itemMiddleRect.offsetTop,
        scrollTop: getScrollPosition(this.scrollTarget),
        scrollHeight: getScrollHeight(this.scrollTarget),
      }
      this.itemsRes.setProperty('currentId', key)
      this.itemsRes.setProperty('itemMiddle', this.itemMiddle)
    },
    async positionDrop () {
      this.$log('positionDrop')
      setScrollPosition(this.scrollTarget, 0, 1)
      await this.$wait(500)
      this.itemsRes.gotoStart()
      this.itemsRes.setProperty('itemMiddle', null)
    },
    scrollUpdate (e) {
      // this.$log('scrollUpdate')
      this.scrollTop = getScrollPosition(this.scrollTarget)
      this.scrollHeight = getScrollHeight(this.scrollTarget)
    }
  },
  async mounted () {
    this.$log('mounted')
    this.scrollTarget = getScrollTarget(this.$el)
    this.scrollTarget.addEventListener('scroll', this.scrollUpdate)
    // todo попробовать убрать wait
    this.$wait(600).then(() => {
      this.scrollUpdate()
      this.prev()
    })
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    this.scrollTarget.removeEventListener('scroll', this.scrollUpdate)
  }
}
</script>
