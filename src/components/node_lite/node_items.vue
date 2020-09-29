<style lang="sass">
.items-min-height
  &:before
    content: ""
    display: block
    padding-top: 50%
    float: left
</style>

<template lang="pug">
//- :class=`{'items-min-height': true}`
div(
  :class=`{'items-min-height': true}`
  :style=`{position: 'relative',overflow: 'hidden',}`).row.full-width.items-start.content-start.fit
  //- items preview: first item from meta => shaping the size
  //- loading="lazy"
  img(
    @load="previewLoad"
    @error="previewErrored"
    :src="previewUrl"
    :alt="previewName"
    draggable="false"
    :style=`{
      userSelect: 'none', objectFit: 'contain',
      maxHeight: $q.screen.height-300+'px',
      opacity: started ? 0 : 1,
    }`
    ).full-width.fit
  //- items in pip
  //- list-horizontal(:items="items")
  list-pip(:items="items" :prevBtnShow="isActive").fit
    template(v-slot:item=`{item,itemIsFirst,itemIsLast,itemIndex,itemActive,itemNexting,next,prev,started,ended}`)
      composition-player(
        :isActive="isActive && itemActive" :isVisible="isVisible" :composition="item"
        :class=`{
          'full-height': itemActive || itemNexting,
        }`
        @previewClick="next()"
        @started="started(itemIndex), itemsStarted()"
        @ended="ended(itemIndex)"
        :options=`{
          isFit: itemActive || itemNexting,
          loop: items.length === 1
        }`
        :style=`{
          position: 'relative',
          borderRadius: '10px',
          overflow: 'hidden',
        }`).bg-black.fit
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import listPip from 'components/list_pip/index.vue'
import compositionPlayer from 'components/composition/composition_player/index.vue'

export default {
  name: 'nodeLite_nodeItems',
  components: {listPip, compositionPlayer},
  props: ['previewUrl', 'previewName', 'items', 'isActive', 'isVisible'],
  data () {
    return {
      started: false,
      // preview
      previewLoaded: false,
      previewError: null,
      itemsEnded: false,
    }
  },
  computed: {
  },
  watch: {
  },
  methods: {
    itemEnded (i, cb) {
      this.$log('itemEnded', i, cb)
      if (this.items.length - 1 === i) {
        this.itemsEnded = true
        let index = 0
        cb(index)
      }
      else {
        cb(i)
      }
    },
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
