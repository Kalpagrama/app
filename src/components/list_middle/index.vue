<template lang="pug">
.row.full-width.items-start.content-start
  q-resize-observer(@resize="e => width = e.width" :debounce="500")
  slot
  div(
    v-for="(i,ii) in items" :key="i[itemKey]" :accessKey="ii"
    :style=`{
      position: 'relative',
      ...itemStyles,
    }`
    v-observe-visibility=`{
      callback: indexMiddleHandler,
      intersection: {
        rootMargin: rootMargin
      }
    }`
    ).row.full-width.items-start.content-start
    slot(
      name="item"
      :item="i"
      :itemIndex="ii"
      :isActive="indexMiddle === ii"
      :isVisible="ii === indexMiddle || ii === indexMiddle-1 || ii === indexMiddle+1"
      :width="width")
  slot(name="append")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'listMiddle',
  props: {
    items: {type: Array, default () { return [] }},
    itemKey: {
      type: String,
      default () {
        return 'oid'
      }
    },
    itemStyles: {type: Object, default () { return {} }},
    rootMargin: {type: String, default () { return '-50% 0px' }}
  },
  data () {
    return {
      width: 0,
      indexMiddle: -1
    }
  },
  methods: {
    indexMiddleHandler (isVisible, entry, i) {
      let index = parseInt(entry.target.accessKey)
      if (isVisible) {
        this.indexMiddle = index
        this.$log('indexMiddle', index)
      }
      else {
        if (index === this.indexMiddle) {
          this.indexMiddle = -1
        }
      }
    },
  },
  mounted () {
    this.$log('mounted')
  }
}
</script>
