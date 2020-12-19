<template lang="pug">
.row.full-width.justify-center.items-center.content-center
  .row.full-width.justify-center.q-px-sm.q-py-xs
    div(:style=`{maxWidth: '500px'}`).row.full-width.items-start.content-start
      slot(name="action-left")
      //- q-btn(
        round flat color="grey-9" icon="reply")
      kalpa-share(type="node" :item="node")
      .col.full-height
        node-vote-bar(v-if="node" :node="node")
      slot(name="action-right")
      kalpa-bookmark(
        v-if="!$slots['action-left']"
        :oid="node.oid" :type="node.type" :name="node.name"
        :thumbUrl="node.thumbUrl" :isActive="isActive" inactiveColor="grey-9")
</template>

<script>
import { ObjectApi } from 'src/api/object'
import nodeVoteBar from 'components/node/node_vote_bar.vue'

export default {
  name: 'nodeActions',
  props: {
    node: {type: Object, required: true},
    isActive: {type: Boolean},
    isVisible: {type: Boolean}
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
        if (this.$store.getters.currentUser().profile.role === 'GUEST') return
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
  }
}
</script>
