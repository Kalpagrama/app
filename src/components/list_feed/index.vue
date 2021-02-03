<template lang="pug">
.row.full-width
  //- debug top
  div(:style=`{position: 'fixed', zIndex: 999999, right: '0px', top: '50px'}`).row.bg-red.text-white
    small.full-width scrollTop: {{scrollTop}}
    small.full-width scrollHeight: {{scrollHeight}}
    q-btn(outline color="white" dense no-caps @click="itemsRes.gotoStart()") Go to start
  div(
    v-if="scrollTarget && !itemsRes"
    :style=`{
      paddingTop: ((scrollTarget.clientHeight || scrollTarget.innerHeight)/2)-25+'px',
    }`
    ).row.full-width.justify-center
    q-spinner(size="50px" color="green")
  div(
    v-if="itemsRes"
    :style=`{
      //- position: 'relative',
    }`
    ).row.full-width.items-start.content-start
    //- q-resize-observer(@resize="onResize")
    //- prepend slot
    //- slot(name="prepend")
    //- prev loading
    //- div(
      v-if="itemsPreving"
      :style=`{
        height: '60px',
      }`
      ).row.full-width.items-center.content-center.justify-center
      q-spinner-dots(color="green" size="50px")
    div(
      v-for="(item, itemIndex) in itemsRes.items" :key="item[itemKey]"
      :ref="`item-${item[itemKey]}`"
      :accessKey="item[itemKey]"
      :style=`{
        ...itemStyles,
      }`
      v-observe-visibility=`{
        throttle: 200,
        callback: indexMiddleHandler,
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
      //- footer debug
      //- .row.full-width
        q-btn(@click="positionSave()" dense no-caps color="green" outline) Save position
        q-btn(@click="positionDrop()" dense no-caps color="red" outline) Drop position
        q-btn(@click="prev()" dense no-caps color="red" outline) Prev
        q-btn(@click="next()" dense no-caps color="red" outline) Next
        q-btn(@click="cutHere(item[itemKey])" dense no-caps color='white' outline) Cut here
        .row.full-width
          small.text-white itemKey: {{ item[itemKey] }}
        .row.full-width
          small.text-white scrollTop: {{ scrollTop }}, scrollHeight: {{ scrollHeight }},
    //- next loading
    div(
      v-if="itemsNexting"
      :style=`{
        height: '60px',
      }`
      ).row.full-width.items-center.content-center.justify-center
      q-spinner-dots(color="green" size="50px")
    //- append slot
    slot(name="append")
</template>

<script>
import { scroll } from 'quasar'
const { getScrollTarget, getScrollPosition, setScrollPosition, getScrollHeight } = scroll

export default {
  name: 'listFeed',
  props: {
    root: {
      type: Object,
    },
    rootMargin: {type: String, default () { return '-50% 0px' }},
    query: {
      type: Object,
      required: true,
    },
    itemKey: {
      type: String,
      default: 'oid'
    },
    itemStyles: {
      type: Object,
      default () {
        return {}
      }
    }
  },
  data () {
    return {
      itemsRes: null,
      itemsResInited: false,
      itemsResFirstKey: null,
      // prev, next
      itemsPreving: false,
      itemsNexting: false,
      // middle key
      itemMiddleKey: null,
      // scroll data
      scrollTop: 0,
      scrollHeight: 0,
      scrollTarget: null,
    }
  },
  computed: {
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
        let currentId = this.itemsRes.getProperty('currentId')
        if (currentId) {
          this.$log('currentId', currentId)
          let itemMeta = this.itemsRes.getProperty('itemMeta')
          if (itemMeta) {
          }
        }
      }
    },
    'itemsRes.items': {
      async handler (to, from) {
        this.$log('itemsRes.items', to ? to.length : 0, from ? from.length : 0)
        // save old scroll height
        let scrollHeightOld = this.scrollHeight
        let scrollTopOld = this.scrollTop
        // where items changed ? at top or at bottom ?
        let isReversed = this.itemsResFirstKey !== to[0][this.itemKey]
        // set last first key...
        this.itemsResFirstKey = to[0][this.itemKey]
        // call this no on first load
        if (this.itemsResInited) {
          if (isReversed) {
            this.$nextTick(() => {
              this.$log('REVERSED REVERSED COMPENSATION')
              this.scrollUpdate()
              // let itemMeta = this.itemsRes.getProperty('itemMeta')
              // this.$log('itemMeta', itemMeta)
              const heightAfter = this.scrollHeight
              const heightDifference = heightAfter - scrollHeightOld
              // this.$log({scrollHeightOld, heightAfter, scrollTopOld, heightDifference})
              // compute scroll position when ?
              setScrollPosition(this.scrollTarget, scrollTopOld + heightDifference)
              this.scrollUpdate()
              this.prev()
            })
          }
        }
        // first load done
        this.itemsResInited = true
      }
    },
    scrollTop: {
      immediate: true,
      handler (to, from) {
        if (!this.itemsRes) return
        if (this.scrollHeight - to < 2000) this.next()
        if (to < 2000) this.prev()
      }
    }
  },
  methods: {
    async prev () {
      if (this.itemsRes.hasPrev && !this.itemsPreving) {
        this.$log('prev prev prev')
        this.$q.notify({message: 'prev prev prev', position: 'right', type: 'positive'})
        this.itemsPreving = true
        await this.itemsRes.prev()
        await this.$wait(300)
        this.itemsPreving = false
      }
    },
    async next () {
      this.$log('next')
      if (this.itemsRes.hasNext && !this.itemsNexting) {
        this.$log('next next next')
        this.$q.notify({message: 'next next next', position: 'right', type: 'positive'})
        this.itemsNexting = true
        await this.itemsRes.next()
        await this.$wait(300)
        this.itemsNexting = false
      }
    },
    cutHere (id) {
      this.$log('cutHere')
      this.itemsRes.setProperty('currentId', id)
      this.itemsRes.gotoCurrent(id)
    },
    indexMiddleHandler (isVisible, entry, i) {
      if (isVisible) {
        this.itemMiddleKey = entry.target.accessKey
        this.positionSave()
      }
      // TODO: handle -1
    },
    positionSave () {
      this.$log('positionSave')
      let [itemRef] = this.$refs[`item-${this.itemMiddleKey}`]
      if (itemRef) {
        let itemRect = itemRef.getBoundingClientRect()
        this.itemsRes.setProperty('currentId', this.itemMiddleKey)
        const itemMetaInput = {
          top: itemRect.top,
          bottom: itemRect.bottom,
          left: itemRect.left,
          right: itemRect.right,
          width: itemRect.width,
          height: itemRect.height,
          key: this.itemMiddleKey,
          offsetTop: itemRef.offsetTop,
          scrollHeight: this.scrollHeight,
          scrollTop: this.scrollTop
        }
        this.itemsRes.setProperty('itemMeta', itemMetaInput)
      }
    },
    async positionDrop () {
      this.$log('positionDrop')
      this.itemsRes.setProperty('currentId', null)
      this.itemsRes.setProperty('itemMeta', null)
      await this.itemsRes.gotoCurrent(null)
    },
    getScrollTop () {
      // if (this.root) {
      //   return this.root.scrollTop
      // }
      // else {
      //   return window.pageYOffset
      // }
      return getScrollPosition(this.scrollTarget)
    },
    getScrollHeight () {
      // if (this.root) {
      //   return this.root.scrollHeight
      // }
      // else {
      //   return document.body.scrollHeight
      // }
      return getScrollHeight(this.scrollTarget)
    },
    scrollOn () {
      this.$log('scrollOn')
      // if (this.root) {
      //   this.root.addEventListener('scroll', this.scrollUpdate)
      // }
      // else {
      //   window.addEventListener('scroll', this.scrollUpdate)
      // }
      this.scrollTarget.addEventListener('scroll', this.scrollUpdate)
    },
    scrollOff () {
      this.$log('scrollOff')
      // if (this.root) {
      //   this.root.removeEventListener('scroll', this.scrollUpdate)
      // }
      // else {
      //   window.removeEventListener('scroll', this.scrollUpdate)
      // }
      this.scrollTarget.removeEventListener('scroll', this.scrollUpdate)
    },
    scrollUpdate (e) {
      // this.$log('scrollUpdate')
      this.scrollTop = this.getScrollTop()
      this.scrollHeight = this.getScrollHeight()
    },
    onResize (e) {
      // this.$log('onResize')
      this.scrollTop = this.getScrollTop()
      this.scrollHeight = this.getScrollHeight()
      // this.$log('onResize DONE', this.scrollHeight)
    }
  },
  async mounted () {
    this.scrollTarget = getScrollTarget(this.$el)
    this.$log('mounted', this.scrollTarget)
    this.scrollOn()
    this.scrollUpdate()
    // this.prev()
    // await this.$wait(500)
    // if (this.itemsRes) this.prev()
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    this.scrollOff()
    // this.positionSave()
  }
}
</script>
