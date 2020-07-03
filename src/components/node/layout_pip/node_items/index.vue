<template lang="pug">
div(:style=`{position: 'relative',overflow: 'hidden',}`).row.full-width
  //- items preview: first item from meta => shaping the size
  img(
    @load="previewLoad"
    @error="previewErrored"
    :src="previewUrl" draggable="false"
    :style=`{
      userSelect: 'none', objectFit: 'contain',
      maxHeight: $q.screen.height-200+'px',
      opacity: started ? 0 : 1,
    }`
    ).full-width
  //- items in pip
  //- list-horizontal(:items="items")
  list-pip(:items="items" :prevBtnShow="active")
    template(v-slot:item=`{item,itemIsFirst,itemIsLast,itemIndex,itemActive,itemNexting,next,prev,started,ended}`)
      composition(
        :ctx="ctx" :preview="node.meta.items[itemIndex].thumbUrl" :value="item"
        :visible="visible"
        :loop="itemIsFirst && itemIsLast"
        :active="active && itemActive"
        :mini="mini || !itemActive || itemNexting"
        :itemsCount="items.length"
        :class=`{
          'full-height': itemActive || itemNexting,
        }`
        @previewClick="next()"
        @started="started(itemIndex), itemsStarted()"
        @ended="ended(itemIndex)"
        :style=`{
          position: 'relative',
          borderRadius: $store.state.ui.borderRadius+'px',
          overflow: 'hidden',
        }`)
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'nodeLayoutPip-nodeItems',
  props: ['ctx', 'node', 'nodeFull', 'visible', 'active', 'mini'],
  data () {
    return {
      started: false,
      // preview
      previewLoaded: false,
      previewError: null
    }
  },
  computed: {
    previewUrl () {
      return this.node.meta.items[0].thumbUrl
    },
    items () {
      if (!this.nodeFull) return []
      else return this.nodeFull.items
    }
  },
  watch: {
    active: {
      handler (to, from) {
        this.$log('active CHANGED', to)
        // alert('nodeItems active CHANGED: ' + to)
      }
    },
  },
  methods: {
    itemsStarted () {
      this.$log('itemsStarted')
      this.started = true
    },
    previewLoad () {
      // this.$log('previewLoad')
      this.previewLoaded = true
    },
    previewErrored (e) {
      this.$log('previewErrored', e)
      this.previewError = e
    },
  }
}
</script>
