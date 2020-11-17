<template lang="pug">
.row.full-width.justify-center.items-center.content-center
  q-dialog(
    v-model="showStats" position="bottom")
    node-stats(
      :node="node" :isActive="isActive" :isVisible="isVisible"
      @close="showStats = false")
  //- actions wrapper
  div(:style=`{maxWidth: '500px', height: '50px',}`).row.full-width.items-start.content-start
    div(
      v-if="useBookmark"
      :style=`{
        position: 'relative',
        paddingTop: '2px',
      }`
      ).row.items-start.content-start.justify-center.q-px-xs
      kalpa-bookmark(:oid="node.oid" :type="useBookmarkType" :name="node.name" :thumbUrl="node.thumbUrl" :isActive="isActive" inactiveColor="grey-9").shaking
    .col.full-height
      node-vote-bar(:node="node")
    node-connect(v-if="useConnect || true" :node="node" :isActive="isActive" :isVisible="isVisible")
</template>

<script>
import { ObjectApi } from 'src/api/object'

import nodeShare from 'components/node/node_share.vue'
import nodeRemake from 'components/node/node_remake.vue'
import nodeConnect from 'components/node/node_connect.vue'
import nodeVote from 'components/node/node_vote.vue'
import nodeVoteBar from 'components/node/node_vote_bar.vue'
import nodeStats from 'components/node/node_stats/index.vue'

export default {
  name: 'nodeActions',
  props: {
    node: {type: Object, required: true},
    isActive: {type: Boolean},
    isVisible: {type: Boolean},
    useShare: {type: Boolean, default: true},
    useBookmark: {type: Boolean, default: true},
    useBookmarkType: {type: String, default: 'NODE'},
    useRemake: {type: Boolean, default: true},
    useConnect: {type: Boolean, default: true},
    useVote: {type: Boolean, default: true},
  },
  components: {
    nodeShare, nodeRemake, nodeStats, nodeVote, nodeVoteBar, nodeConnect,
  },
  data () {
    return {
      showStats: false,
      isActiveStart: 0,
      votesShow: false,
    }
  },
  watch: {
    isActive: {
      async handler (to, from) {
        if (to) {
          this.isActiveStart = Date.now()
        }
        else {
          let statValue = Date.now() - this.isActiveStart
          // this.$log('statValue', statValue)
          let stat = await ObjectApi.updateStat(this.node.oid, 'VIEWED_TIME', statValue)
          // this.$log('statValue stat', stat)
          this.isActiveStart = 0
        }
      }
    }
  },
}
</script>
