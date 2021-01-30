<template lang="pug">
div(
  v-if="itemsRes"
  ).row.full-width.items-start.content-start
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
    .row.full-width
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
    'itemsRes.items': {
      handler (to, from) {
        this.$log('itemsRes.items', to, from)
        // items changed, changed scrollHeightOld => scrollHeightNew
        // let scrollHeightOld = this.scrollHeight
        // let scrollHeightNew = this.scrollHeight
        // let delta = scrollHeightNew - scrollHeightOld
        // until new items adding and scrollHeight is changing we scroll back to compensate...
      }
    }
  },
  methods: {
    prev () {
      this.$log('prev')
      this.rootLocal.style.overflow = 'hidden'
      if (this.itemsRes.hasPrev) this.itemsRes.prev()
      this.rootLocal.style.overflow = 'auto'
    },
    next () {
      this.$log('next')
      this.rootLocal.style.overflow = 'hidden'
      if (this.itemsRes.hasNext) this.itemsRes.next()
      this.rootLocal.style.overflow = 'auto'
    },
    cutHere (id) {
      this.$log('cutHere')
      this.itemsRes.setProperty('currentId', id)
      this.itemsRes.goToItem(id)
    },
    indexMiddleHandler (isVisible, entry, i) {
      // let index = parseInt(entry.target.accessKey)
      if (isVisible) {
        // this.$log('indexMiddleHandler', isVisible, entry, i)
        // this.indexMiddle = index
        this.itemMiddleKey = entry.target.accessKey
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
        this.$log('positionSave itemMetaInput', itemMetaInput)
        this.itemsRes.setProperty('itemMeta', itemMetaInput)
        let itemMeta = this.itemsRes.getProperty('itemMeta')
        this.$log('positionSave itemMeta', itemMeta)
        this.$log('positionSave itemMetaInput = itemMeta', itemMetaInput === itemMeta)
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
      this.$log('rootOnScroll')
      this.scrollTop = window.pageYOffset
      this.scrollHeight = this.rootLocal.scrollHeight
      // this.scrollHeight = window.scrollHeight
    }
  },
  async mounted () {
    this.$log('mounted')
    // this.$log('mounted window', window)
    // this.$log('mounted document', document)
    this.$log('mounted document.body', document.body.scrollTop)
    this.itemsRes = await this.$rxdb.find(this.query, true)
    let currentId = this.itemsRes.getProperty('currentId')
    if (currentId) {
      this.$log('currentId', currentId)
      let itemMeta = this.itemsRes.getProperty('itemMeta')
      if (itemMeta) {
        this.$log('itemMeta', itemMeta)
        // this.$log('rootLocal', this.rootLocal.scrollTop, this.rootLocal.scrollHeight)
        // await this.$wait(1000)
        // window.scrollTop = itemMeta.scrollTop
        window.scrollTo(0, itemMeta.scrollTop)
      }
    }
    // if (this.itemsRes.hasPrev) this.itemsRes.prev()
    // if (this.itemsRes.hasNext) this.itemsRes.next()
    // TODO: handle -1 to 0 first element
    // TODO: handle no elements at all event
    // TODO: handle emit items update, items count, preving, nexting, saved position
    window.addEventListener('scroll', this.rootOnScroll)
    await this.$wait(1000)
    this.rootOnScroll()
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    window.removeEventListener('scroll', this.rootOnScroll)
    // this.positionSave()
  }
}
</script>
