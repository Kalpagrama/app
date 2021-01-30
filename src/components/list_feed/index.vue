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
      q-btn(@click="positionSave()" flat dense no-caps color="red" outline) Save position
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
    }
  },
  computed: {
    rootLocal () {
      return this.roor || window
    }
  },
  methods: {
    indexMiddleHandler (isVisible, entry, i) {
      // let index = parseInt(entry.target.accessKey)
      if (isVisible) {
        this.$log('indexMiddleHandler', isVisible, entry, i)
        // this.indexMiddle = index
        this.itemMiddleKey = entry.target.accessKey
      }
      // TODO: handle -1
    },
    positionSave () {
      this.$log('positionSave')
      let [itemRef] = this.$refs[`item-${this.itemMiddleKey}`]
      if (itemRef) {
        let itemRect = itemRef.getBoundingClientRect()
        this.itemsRes.setProp('itemMeta', {
          top: itemRect.top,
          bottom: itemRect.bottom,
          left: itemRect.left,
          right: itemRect.right,
          width: itemRect.width,
          height: itemRect.height,
          key: this.itemMiddleKey,
        })
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
