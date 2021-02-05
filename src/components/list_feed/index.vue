<template lang="pug">
.row.full-width
  //- debug top
  //- div(:style=`{position: 'fixed', zIndex: 999999, right: '0px', top: '30%',maxWidth: '200px',}`).row.bg-red.text-white
    .row.full-width
      small scrollTop: {{scrollTop}}, scrollHeight: {{scrollHeight}}
    q-btn(outline color="white" dense no-caps @click="positionDrop()") Go to start
    q-btn(outline color="white" dense no-caps @click="prev()") Prev
    q-btn(outline color="white" dense no-caps @click="next()") Next
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
    itemKey () {
      return this.itemsRes ? this.itemsRes.itemPrimaryKey : null
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
        this.$log('itemsRes DONE DONE DONE')
      }
    },
    'itemsRes.items': {
      async handler (to, from) {
        this.$log('itemsRes.items', to ? to.length : 0, from ? from.length : 0)
        if (this.itemsResInited) {
          this.$nextTick(() => {
            this.$log('CION start')
            // this.scrollUpdate()
            let itemMeta = this.itemsRes.getProperty('itemMeta')
            if (itemMeta) {
              // this.$log('itemMeta', itemMeta)
              this.$log('CION itemMeta', itemMeta.key)
              let itemRef = this.$refs[`item-${itemMeta.key}`][0]
              this.$log('CION itemRef', itemRef)
              this.$log('CION itemRef.offsetTop', itemRef.offsetTop)
              this.$log('CION this.scrollTarget', this.scrollTarget)
              this.$log('CION this.itemRef.offsetTop', itemRef.offsetTop)
              this.$log('CION this.itemMeta.offsetTop', itemMeta.offsetTop)
              this.$log('CION this.scrollTop', this.scrollTop)
              // this.$q.notify({type: 'positive', position: 'left', message: itemRef.offsetTop})
              setScrollPosition(this.scrollTarget, itemRef.offsetTop - itemMeta.offsetTop + this.scrollTop)
              // this.prev()
            }
          })
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
        // this.$q.notify({message: 'prev prev prev', position: 'right', type: 'positive'})
        this.itemsPreving = true
        await this.itemsRes.prev()
        await this.$wait(300)
        this.itemsPreving = false
      }
    },
    async next () {
      if (this.itemsRes.hasNext && !this.itemsNexting) {
        this.$log('next next next')
        // this.$q.notify({message: 'next next next', position: 'right', type: 'positive'})
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
        if (!this.positionSaving) return
        this.itemMiddleKey = entry.target.accessKey
        this.positionSave()
      }
      // TODO: handle -1
    },
    positionSave () {
      this.$log('positionSave')
      let [itemRef] = this.$refs[`item-${this.itemMiddleKey}`]
      this.$log('itemRef', itemRef)
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
        // this.$q.notify({type: 'positive', position: 'top', message: 'itemRef.offsetTop::' + itemRef.offsetTop})
        this.$log('itemMeta', itemMetaInput)
        this.itemsRes.setProperty('itemMeta', itemMetaInput)
      }
      else {
        alert('no itemRef !!!')
      }
    },
    async positionDrop () {
      this.$log('positionDrop')
      await this.itemsRes.gotoStart()
      setScrollPosition(this.scrollTarget, 0)
    },
    getScrollTop () {
      return getScrollPosition(this.scrollTarget)
    },
    getScrollHeight () {
      return getScrollHeight(this.scrollTarget)
    },
    scrollOn () {
      this.$log('scrollOn')
      this.scrollTarget.addEventListener('scroll', this.scrollUpdate)
    },
    scrollOff () {
      this.$log('scrollOff')
      this.scrollTarget.removeEventListener('scroll', this.scrollUpdate)
    },
    scrollUpdate (e) {
      // this.$log('scrollUpdate')
      this.scrollTop = this.getScrollTop()
      this.scrollHeight = this.getScrollHeight()
      // TODO: positionSave with throttle on scrolling, to return the same position...
    }
  },
  async mounted () {
    this.scrollTarget = getScrollTarget(this.$el)
    this.$log('mounted')
    this.scrollOn()
    this.scrollUpdate()
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    this.scrollOff()
  }
}
</script>
