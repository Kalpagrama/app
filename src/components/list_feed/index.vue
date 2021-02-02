<template lang="pug">
div(
  v-if="itemsRes"
  ).row.full-width.items-start.content-start
  q-resize-observer(@resize="onResize")
  //- prepend slot
  slot(name="prepend")
  //- :accessKey="itemIndex"
  div(
    v-for="(item, itemIndex) in itemsRes.items" :key="item[itemKey]"
    :ref="`item-${item[itemKey]}`"
    :accessKey="item[itemKey]"
    :style=`{
      //- height: '300px',
      //- border: item[itemKey] === itemMiddleKey ? '2px solid red' : 'none',
      ...itemStyles,
    }`
    v-observe-visibility=`{
      throttle: 200,
      callback: indexMiddleHandler,
      intersection: {
        rootMargin: rootMargin
      }
    }`
    ).row.full-width.items-start.content-start.q-mb-xl
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
  slot(name="append")
</template>

<script>
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
      itemsPreving: false,
      itemsNexting: false,
      indexMiddle: 0,
      itemMiddleKey: null,
      scrollTop: 0,
      scrollHeight: 0,
    }
  },
  computed: {
    rootLocal () {
      return this.root || document.body
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
              this.rootOnScroll()
              const heightAfter = this.scrollHeight
              // const scrollPosition = this.scrollTop
              // const scrollTopOld
              const heightDifference = heightAfter - scrollHeightOld
              this.$log({scrollHeightOld, heightAfter, scrollTopOld, heightDifference})
              window.scrollTo(0, scrollTopOld + heightDifference)
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
        this.$q.notify('prev prev prev')
        this.itemsPreving = true
        await this.itemsRes.prev()
        await this.$wait(300)
        this.itemsPreving = false
        // this.rootOnScroll()
      }
    },
    async next () {
      this.$log('next')
      if (this.itemsRes.hasNext && !this.itemsNexting) {
        this.$log('next next next')
        this.$q.notify('next next next')
        this.itemsNexting = true
        await this.itemsRes.next()
        await this.$wait(300)
        this.itemsNexting = false
        // this.rootOnScroll()
      }
    },
    cutHere (id) {
      this.$log('cutHere')
      this.itemsRes.setProperty('currentId', id)
      this.itemsRes.gotoCurrent(id)
    },
    indexMiddleHandler (isVisible, entry, i) {
      // let index = parseInt(entry.target.accessKey)
      if (isVisible) {
        // this.$log('indexMiddleHandler', isVisible, entry, i)
        // this.indexMiddle = index
        this.itemMiddleKey = entry.target.accessKey
        this.positionSave()
      }
      // TODO: handle -1
    },
    positionSave () {
      this.$log('positionSave')
      let [itemRef] = this.$refs[`item-${this.itemMiddleKey}`]
      if (itemRef) {
        // this.$log('itemRef offsetTop', itemRef.offsetTop)
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
        // this.$log('positionSave itemMetaInput', itemMetaInput)
        this.itemsRes.setProperty('itemMeta', itemMetaInput)
        let itemMeta = this.itemsRes.getProperty('itemMeta')
        // this.$log('positionSave itemMeta', itemMeta)
        // this.$log('positionSave itemMetaInput = itemMeta', itemMetaInput === itemMeta)
      }
    },
    positionRestore () {
      this.$log('positionRestore')
    },
    positionDrop () {
      this.$log('positionDrop')
      this.itemsRes.setProperty('currentId', null)
      this.itemsRes.setProperty('itemMeta', null)
      let currentId = this.itemsRes.getProperty('currentId')
      let itemMeta = this.itemsRes.getProperty('itemMeta')
      this.$log('positionDrop currentId', currentId)
      this.$log('positionDrop itemMeta', itemMeta)
    },
    rootOnScroll (e) {
      // this.$log('rootOnScroll', this.scrollHeight)
      this.scrollTop = window.pageYOffset
      this.scrollHeight = this.rootLocal.scrollHeight
      // this.$log('rootOnScroll DONE', this.scrollHeight)
    },
    onResize (e) {
      this.$log('onResize', this.scrollHeight)
      this.scrollTop = window.pageYOffset
      this.scrollHeight = this.rootLocal.scrollHeight
      this.$log('onResize DONE', this.scrollHeight)
    }
  },
  async mounted () {
    this.$log('mounted')
    // this.$log('mounted window', window)
    // this.$log('mounted document', document)
    // this.$log('mounted document.body', document.body.scrollTop)
    window.addEventListener('scroll', this.rootOnScroll)
    this.rootOnScroll()
    await this.$wait(500)
    if (this.itemsRes) this.prev()
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    window.removeEventListener('scroll', this.rootOnScroll)
  }
}
</script>
