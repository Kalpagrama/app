<template lang="pug">
.row.full-width.justify-center.items-center.content-center
  div(:style=`{maxWidth: '500px'}`).row.full-width.items-start.content-start
    slot(name="action-left")
    kalpa-bookmark(
      v-if="!$slots['action-left']"
      :oid="node.oid" :type="useBookmarkType" :name="node.name" :thumbUrl="node.thumbUrl" :isActive="isActive" inactiveColor="grey-9")
    .col.full-height
      node-vote-bar(v-if="node" :node="node")
    slot(name="action-right")
    q-btn(
      v-if="!$slots['action-right']"
      @click="$router.push('/workspace/joint/new?oid='+node.oid)"
      round flat color="green")
      q-icon(name="link" size="30px" color="grey-9")
</template>

<script>
import { ObjectApi } from 'src/api/object'
import nodeVoteBar from 'components/node/node_vote_bar.vue'

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
    nodeVoteBar,
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
          this.$log('statValue', statValue)
          let stat = await ObjectApi.updateStat(this.node.oid, 'VIEWED_TIME', statValue)
          // this.$log('statValue stat', stat)
          this.isActiveStart = 0
        }
      }
    }
  },
}
</script>
