<template lang="pug">
.row.full-width.justify-center.items-center.content-center
  q-dialog(
    v-model="showStats" position="bottom")
    node-stats(
      :node="node" :isActive="isActive" :isVisible="isVisible"
      @close="showStats = false")
  //- actions wrapper
  div(:style=`{maxWidth: '700px'}`).row.full-width.items-center.content-center.q-mb-xs
    node-share(:node="node").shaking
    node-remake(:node="node").shaking
    kalpa-bookmark(:oid="node.oid" type="NODE" :name="node.name" :thumbUrl="node.items[0].thumbUrl" :isActive="isActive").shaking
    node-connect(:node="node" :isActive="isActive" :isVisible="isVisible")
    //- vote
    .col
      .row.fit.items-center.content-center.justify-end
        q-btn(
          @click="showStats = true"
          flat dense no-caps color="grey-2")
          span.text-white.text-bold {{ $nodeRateTitle(node.rate) }}
    div(:style=`{width: '60px'}`).row.justify-center
      node-vote(:node="node")
</template>

<script>
import nodeRemake from 'components/node/node_remake.vue'
import nodeBookmark from 'components/node/node_bookmark.vue'
import nodeShare from 'components/node/node_share.vue'
import nodeStats from 'components/node/node_stats/index.vue'
import nodeConnect from 'components/node/node_connect.vue'
import nodeVote from 'components/node/node_vote.vue'

export default {
  name: 'nodeActions',
  props: ['node', 'isActive', 'isVisible'],
  components: {
    nodeRemake, nodeBookmark, nodeShare, nodeStats, nodeVote, nodeConnect,
  },
  data () {
    return {
      showStats: false,
    }
  },
  methods: {
  }
}
</script>
