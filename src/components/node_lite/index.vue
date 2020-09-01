<template lang="pug">
.row.full-width.items-start.content-start.q-mb-xl
  div(
    :style=`{
      borderRadius: '10px', overflow: 'hidden',
    }`
    ).row.full-width.items-start.content-start.b-40
    //- header: author, createdAt
    .row.full-width.items-center.content-center.q-pa-sm
      q-btn(
        :to="'/user/'+node.meta.author.oid"
        flat color="white" dense no-caps
        )
        user-avatar(:url="node.meta.author.thumbUrl" :width="24" :height="24")
        span.text-grey-4.q-ml-sm {{ node.meta.author.name }}
      .col
      small.text-grey-8.q-mr-sm {{ $date(node.createdAt, 'DD.MM.YYYY') }}
    //- wrapper: composition + essence
    div(
      :style=`{
        borderRadius: '10px', overflow: 'hidden',
      }`
      ).row.full-width.items-start.content-start
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
        //- fullscreen toggler
        q-btn(
          @click="isFullscreen = true"
          flat round color="white" icon="fullscreen"
          :style=`{position: 'absolute', zIndex: 1000, right: '8px', bottom: '8px'}`)
        //- fullscreen
        transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
          node-fullscreen(
            v-if="isFullscreen" :node="node"
            @close="isFullscreen = false")
      //- essence
      div(:style=`{position: 'relative'}`).row.full-width
        router-link(
          :to="'/node/'+node.oid"
          :style=`{
            cursor: 'pointer', borderRadius: '10px', overflow: 'hidden',
          }`
          ).row.full-width.items-center.q-py-md.q-px-md
          span(:style=`{userSelect: 'none'}`).text-white.text-bold {{ node.name }}
    //- actions: share, vote, explore
  div().row.full-width.q-py-xs
    node-share(:node="node")
    .col
    node-vote(:node="node")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import nodeBookmark from './node_bookmark.vue'
import compositionPlayer from 'components/composition/composition_player/index.vue'
import nodeFullscreen from './node_fullscreen.vue'
import nodeShare from './node_share.vue'
import nodeVote from './node_vote.vue'

export default {
  name: 'nodeLite',
  components: {nodeBookmark, compositionPlayer, nodeFullscreen, nodeShare, nodeVote},
  props: ['node', 'isActive', 'isVisible'],
  data () {
    return {
      nodeFull: null,
      composition: null,
      isFullscreen: false,
    }
  },
  computed: {
    itemsActive () {
      return this.isActive && !this.isFullscreen
    }
  },
  watch: {
    isActive: {
      immediate: true,
      async handler (to, from) {
        // this.$log('isActive TO', to, this.node.name)
        if (to) {
          if (!this.nodeFull) this.nodeFull = await this.$rxdb.get(RxCollectionEnum.OBJ, this.node.oid)
          // if (!this.composition) this.composition = await this.$rxdb.get(RxCollectionEnum.OBJ, this.nodeFull.items[0].oid)
        }
      }
    },
  },
  methods: {
  }
}
</script>
