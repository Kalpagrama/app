<template lang="pug">
div(
  :style=`{
    marginBottom: marginBottom+'px',
  }`
  ).row.full-width.items-start.content-start
  div(
    :style=`{
      borderRadius: '10px', overflow: 'hidden',
    }`
    ).row.full-width.items-start.content-start.b-40
    //- header: author, createdAt
    div(
      v-if="showAuthor"
      ).row.full-width.items-center.content-center.q-pa-sm
      q-btn(
        :to="'/user/'+node.meta.author.oid"
        flat color="white" dense no-caps
        )
        user-avatar(:url="node.meta.author.thumbUrl" :width="24" :height="24")
        span.text-grey-4.q-ml-sm {{ node.meta.author.name }}
      .col
      small.text-grey-8.q-mr-xs 11922
      q-icon(name="visibility" color="grey-8").q-mr-md
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
          node-bookmark(v-show="isActive" :isActive="isActive" :isVisible="isVisible" :node="node" :nodeFull="nodeFull")
        node-items(
          :previewUrl="node.meta.items[0].thumbUrl" :items="node.meta.items"
          :isActive="isActive" :isVisible="isVisible")
        //- fullscreen
        //- transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
          node-fullscreen(
            v-if="isFullscreen" :node="node"
            @close="isFullscreen = false")
      //- essence
      div(
        v-if="showEssence"
        :style=`{position: 'relative'}`).row.full-width.items-start.content-start
        .col
          router-link(
            :to="'/node/'+node.oid"
            :style=`{
              cursor: 'pointer', borderRadius: '10px', overflow: 'hidden',
            }`
            ).row.full-width.items-center.q-py-md.q-pl-md
            span(
              :style=`{userSelect: 'none', fontSize: '1.1rem'}`).text-white.text-bold {{ node.name }}
        .row.full-height.items-start.content-start.q-pt-md.q-px-sm
          node-share(:node="node")
          node-vote(:node="node" :nodeFull="nodeFull")
  //- footer
  .row.full-width
    slot(name="footer")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import nodeBookmark from './node_bookmark.vue'
import nodeFullscreen from './node_fullscreen.vue'
import nodeShare from './node_share.vue'
import nodeVote from './node_vote.vue'
import nodeItems from './node_items.vue'

export default {
  name: 'nodeLite',
  components: {nodeBookmark, nodeFullscreen, nodeShare, nodeVote, nodeItems},
  props: {
    node: {type: Object, required: true},
    isActive: {type: Boolean, required: true},
    isVisible: {type: Boolean, required: true},
    showEssence: {type: Boolean, default () { return true }},
    showAuthor: {type: Boolean, default () { return true }},
    marginBottom: {type: Number, default () { return 50 }}
  },
  data () {
    return {
      nodeFull: null,
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
        }
      }
    },
  },
  methods: {
  }
}
</script>
