<template lang="pug">
.row.full-width.justify-center.items-center.content-center
  q-dialog(
    v-model="showStats" position="bottom")
    node-stats(
      :node="node" :isActive="isActive" :isVisible="isVisible"
      @close="showStats = false")
  //- actions wrapper
  div(:style=`{maxWidth: '700px', height: '60px',}`).row.full-width.items-center.content-center
    node-share(v-if="useShare" :node="node").shaking
    div(
      v-if="useBookmark"
      :style=`{
        position: 'relative',
        height: '60px'}`
      ).row.items-center.content-center.justify-center
      kalpa-bookmark(:oid="node.oid" type="NODE" :name="node.name" :thumbUrl="node.thumbUrl" :isActive="isActive" inactiveColor="grey-9").shaking
      //- bookmark count
      div(
        v-if="node.countBookmarks > 0"
        :style=`{position: 'absolute', zIndex: 10, bottom: '0px',}`).row.full-width.justify-center
        small.text-grey-9 {{ node.countBookmarks }}
    node-remake(v-if="useRemake" :node="node").shaking
    node-connect(v-if="useConnect" :node="node" :isActive="isActive" :isVisible="isVisible")
    //- vote
    div(
      v-if="useVote"
      @click="showStats = true"
      ).col.full-height.cursor-pointer
      .row.fit.items-center.content-center.justify-end
        q-btn(
          @click="showStats = true"
          flat dense no-caps color="grey-2").q-px-xs.q-py-xs
          //- span.text-white.text-bold {{ $nodeRateTitle(node.rate) }}
          span(:style=`{fontSize: '18px'}`).text-white.text-bold {{ Math.round((node.rate * 10) * 10) / 10  }}
    node-vote(
      v-if="useVote"
      :node="node"
      :style=`{
        width: '60px', height: '60px',
      }`).items-center.content-center.justify-center
</template>

<script>
import { NodeApi } from 'src/api/node'

import nodeShare from 'components/node/node_share.vue'
import nodeRemake from 'components/node/node_remake.vue'
import nodeConnect from 'components/node/node_connect.vue'
import nodeVote from 'components/node/node_vote.vue'
import nodeStats from 'components/node/node_stats/index.vue'

export default {
  name: 'nodeActions',
  props: {
    node: {type: Object, required: true},
    isActive: {type: Boolean},
    isVisible: {type: Boolean},
    useShare: {type: Boolean, default: true},
    useBookmark: {type: Boolean, default: true},
    useRemake: {type: Boolean, default: true},
    useConnect: {type: Boolean, default: true},
    useVote: {type: Boolean, default: true}
  },
  components: {
    nodeShare, nodeRemake, nodeStats, nodeVote, nodeConnect,
  },
  data () {
    return {
      showStats: false,
      isActiveStart: 0,
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
          this.$log('statValue', statValue)
          let stat = await NodeApi.updateStat(this.node.oid, 'VIEWED_TIME', statValue)
          this.$log('shareStart stat', stat)
          this.isActiveStart = 0
        }
      }
    }
  },
}
</script>
