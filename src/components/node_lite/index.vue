<template lang="pug">
//-  @mouseenter="active = true"
//-  @mouseleave="active = false"
div(
  :style=`{
    borderRadius: '10px', overflow: 'hidden',
    //- minHeight: '200px',
  }`
  ).row.full-width.items-start.content-start.b-50
  //- div(:style=`{position: 'absolute',zIndex: 1000, transform: 'translate3d(0,0,0)', top: '0px', opacity: 0.5}`).row.full-width.q-pa-sm.b-40
    small.text-white.full-width isActive: {{isActive}}
    small.text-white.full-width isVisible: {{isVisible}}
  .row.full-width
    slot(name="header")
  //- composition wrapper
  div(
    :style=`{
      position: 'relative', borderRadius: '10px', overflow: 'hidden',
      cursor: 'pointer',
    }`
    ).row.full-width.items-start.content-start
    //- bookmark
    transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
      node-bookmark(v-show="isActive" :isActive="isActive" :node="node")
    composition-player(:isActive="itemsActive" :isVisible="isVisible" :composition="node.meta.items[0]")
    q-btn(
      @click="isFullscreen = true"
      flat round color="white" icon="fullscreen"
      :style=`{position: 'absolute', zIndex: 1000, right: '8px', bottom: '8px'}`)
  transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
    node-fullscreen(
      v-if="isFullscreen" :node="node"
      @close="isFullscreen = false")
  //- essence link...
  div(:style=`{position: 'relative'}`).row.full-width
    router-link(
      :to="'/node/'+node.oid"
      :class=`{
      }`
      :style=`{
        cursor: 'pointer', borderRadius: '10px', overflow: 'hidden',
      }`
      ).row.full-width.items-center.q-py-md.q-px-md
      span(:style=`{userSelect: 'none'}`).text-white.text-bold {{ node.name }}
  .row.full-width
    slot(name="footer" :node="nodeFull")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import nodeBookmark from './node_bookmark.vue'
import compositionPlayer from 'components/composition/composition_player/index.vue'
import nodeFullscreen from './node_fullscreen.vue'

export default {
  name: 'nodeLite',
  components: {nodeBookmark, compositionPlayer, nodeFullscreen},
  props: ['node', 'isActive', 'isVisible'],
  data () {
    return {
      nodeFull: null,
      composition: null,
      muted: true,
      isFullscreen: false,
    }
  },
  computed: {
    itemsActive () {
      return this.isActive && !this.isFullscreen
    }
  },
  watch: {
    // isVisible: {
    //   immediate: true,
    //   async handler (to, from) {
    //     // this.$log('isVisible TO', to, this.node.name)
    //     if (to) {
    //       // if (!this.nodeFull) this.nodeFull = await this.$rxdb.get(RxCollectionEnum.OBJ, this.node.oid)
    //       // if (!this.composition) this.composition = await this.$rxdb.get(RxCollectionEnum.OBJ, this.nodeFull.items[0].oid)
    //     }
    //   }
    // },
  },
  methods: {
    videoClicked (e) {
      this.$log('videoClicked', e)
      if (this.muted) {
        this.muted = false
        e.target.play()
      }
      else {
        if (e.target.paused) e.target.play()
        else e.target.pause()
      }
    },
    videoLoadedmetadata (e) {
      // this.$log('videoLoadedmetadata', e)
      if (this.isActive) {
        e.target.play()
      }
    },
    nodeEssenceClick () {
      this.$log('nodeEssenceClick')
      this.$router.push(`/node/${this.node.oid}`).catch(e => e)
    }
  }
}
</script>
