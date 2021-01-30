<template lang="pug">
div(
  v-if="itemsRes"
  ).row.full-width.items-start.content-start
  slot
  div(
    v-for="(item, itemIndex) in itemsRes.items" :key="item[itemKey]"
    :ref="`item-${item[itemKey]}`"
    :accessKey="itemIndex"
    :style=`{
      height: '300px',
      border: itemIndex === indexMiddle ? '2px solid red' : 'none',
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
    slot(:item="item" :itemIndex="itemIndex" :isActive="itemIndex === indexMiddle" :isVisible="true")
    //- .row.full-width
    //-   h1.text-white {{ rootLocal.scrollTop }}
    //- small.text-white {{ item.oid }}
    .row.full-width
      q-btn(@click="positionSave()" flat no-caps color="red" outline) Save position
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
    }
  },
  computed: {
    rootLocal () {
      return this.roor || window
    }
  },
  methods: {
    indexMiddleHandler (isVisible, entry, i) {
      let index = parseInt(entry.target.accessKey)
      if (isVisible) {
        this.$log('indexMiddleHandler', isVisible, entry, i)
        this.indexMiddle = index
      }
      // TODO: handle -1
    },
    positionSave () {
      this.$log('positionSave')
      let item = this.itemsRes.items[this.indexMiddle]
      if (item) {
        let [itemRef] = this.$refs[`item-${item[this.itemKey]}`]
        if (itemRef) {
          let itemRect = itemRef.getBoundingClientRect()
          this.$log('itemRef', itemRect.top, itemRect.height, itemRect.bottom, itemRect.width)
        }
      }
    },
    positionRestore () {
      this.$log('positionRestore')
    },
  },
  async mounted () {
    this.$log('mounted', window)
    this.itemsRes = await this.$rxdb.find(this.query, true)
    // TODO: handle -1 to 0 first element
    // TODO: handle no elements at all event
    // TODO: handle emit items update, items count, preving, nexting, saved position
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    this.positionSave()
  }
}
</script>
