<template lang="pug">
.row.full-width.justify-center.q-px-sm
  //- vote stats
  q-dialog(
    v-model="voteStatsShow" position="bottom")
    node-vote-stats(
      :node="node"
      :style=`{
        height: Math.min(500, $q.screen.height)+'px',
      }`
      @voteAgain="voteAgain"
      @close="voteStatsShow = false")
  div(
    :style=`{
      position: 'relative',
      height: '66px',
      maxWidth: '500px',
    }`).row.full-width.items-start.contnet-start.q-pt-sm
    //- share
    .col
      .row.full-width
        .row.items-center.content-center
          kalpa-share(type="node" :item="node" :headerText="$tt('Share')")
            //- q-tooltip(dense dark) Поделиться
            //- q-btn(round flat color="grey-9")
              q-icon(name="logout" size="23px").rotate-270
        .col
          .row.fit.items-center.content-center.justify-start
            small.text-grey-9 {{ node.countStat.countShares || '' }}
    //- micronodes/comments
    div(
      v-if="node.items.length === 1"
      ).col
      .row.full-width
        .row.items-center.content-center
          q-btn(
            round flat color="grey-9"
            :to="'/node/'+node.oid")
            q-tooltip(dense dark) Микроядра
            q-icon(name="workspaces" size="22px")
        .col
          .row.fit.items-center.content-center.justify-start
            small.text-grey-9 {{ node.countComments || '' }}
    node-vote-ball(:node="node" @click.native="nodeVoteBallClick").q-mt-xs.q-mx-lg
    //- joints/chains
    router-link(
      v-if="node.items.length === 1"
      :to="'/graph/'+node.oid"
      ).col
      .row.full-width
        .col
          .row.fit.items-center.content-center.justify-end
            small.text-grey-9 {{ node.countStat.countJoints || '' }}
        .row.items-center.content-center
          q-btn(round flat color="grey-9")
            q-tooltip(dense dark) Связи
            q-icon(name="fas fa-link" size="20px")
    //- bookmarks
    .col
      .row.full-width
        .col
          .row.fit.items-center.content-center.justify-end
            small.text-grey-9 {{ node.countBookmarks || '' }}
        .row.items-center.content-center
          kalpa-save(
            :item="node" :isActive="isActive" inactiveColor="grey-9")
    //- ======
    //- VOTING:
    //- vote bar
    transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
      div(
        v-if="voteStarted"
        :style=`{
          position: 'absolute', top: '0px', zIndex: 900, left: '0px',
          height: '50px',
          background: nodeBackgroundColor,
          //- background: 'rgb(35,35,35)',
        }`
        ).row.full-width
    transition(enter-active-class="animated zoomIn" leave-active-class="animated zoomOut")
      div(
        v-if="voteStarted"
        :style=`{
          position: 'absolute', top: '0px', zIndex: 1000, left: '0px',
          height: '50px',
        }`
        ).row.full-width.items-center.content-center.justify-center
        div(
          :style=`{
            position: 'relative',
            maxWidth: '500px',
            height: '20px',
            //- borderRadius: '10px',
            //- overflow: 'hidden',
          }`
          ).row.full-width.items-center.content-center
          //- cancel btn
          q-btn(
            @click="voteStarted = false"
            flat dense color="grey-8" no-caps
            :style=`{
              position: 'absolute', zIndex: 2000,
              bottom: '-46px',
            }`).full-width.b-30
            small.text-grey-8 Отмена
          //- vote rates
          div(
            :style=`{
              borderRadius: '10px',
              overflow: 'hidden',
            }`
            ).row.fit.items-center.content-center
            div(
              v-for="r in $rateMeta" :key="r.value"
              @mouseover="rateOver = r.value"
              :style=`{
                background: rateOver === r.value ? r.color : r.colorBackground,
              }`
              ).col.full-height
              div(
                @click="vote(r.value)"
                ).row.fit.items-center.content-center.justify-center.cursor-pointer
                q-spinner(
                  v-if="voteVoting === r.value"
                  color="white" size="10px")
                small(
                  v-else
                  :style=`{fontSize: '9px', pointerEvents: 'none', userSelect: 'none'}`).text-white {{ r.name }}
</template>

<script>
import { ObjectApi } from 'src/api/object'

import nodeVoteBall from './node_vote_ball.vue'
import nodeVoteStats from './node_actions/vote_stats.vue'

export default {
  name: 'nodeActions',
  props: {
    node: {type: Object, required: true},
    nodeBackgroundColor: {type: String},
    nodeActionsColor: {type: String},
    isActive: {type: Boolean},
    isVisible: {type: Boolean}
  },
  components: {
    nodeVoteBall,
    nodeVoteStats,
  },
  data () {
    return {
      showStats: false,
      isActiveStart: 0,
      votesShow: false,
      voteStarted: false,
      voteStatsShow: false,
      voteVoting: null,
      rateOver: null,
    }
  },
  computed: {
  },
  watch: {
    isActive: {
      async handler (to, from) {
        if (this.$store.getters.currentUser().profile.role === 'GUEST') return
        if (to) {
          this.isActiveStart = Date.now()
        }
        else if (this.isActiveStart) {
          let statValue = Date.now() - this.isActiveStart
          // this.$log('statValue', statValue)
          let stat = await ObjectApi.updateStat(this.node.oid, 'VIEWED_TIME', statValue)
          this.isActiveStart = 0
          // handle voteStart
          this.voteStarted = false
          this.voteVoting = false
        }
      }
    }
  },
  methods: {
    nodeVoteBallClick () {
      this.$log('nodeVoteBallClick')
      if (this.$store.getters.currentUser().profile.role === 'GUEST') {
        let authGuard = {
          message: 'Чтобы проголосать и увидеть автора и статистику голосований, войдите в аккаунт.'
        }
        this.$store.commit('ui/stateSet', ['authGuard', authGuard])
      }
      else {
        if (this.node.rateUser || this.node.author.oid === this.$store.getters.currentUser().oid) {
          this.voteStatsShow = true
        }
        else {
          this.voteStarted = true
        }
      }
    },
    async voteAgain () {
      this.$log('voteAgain')
      if (this.node.author.oid === this.$store.getters.currentUser().oid) return
      this.voteStatsShow = false
      await this.$wait(200)
      this.voteStarted = true
    },
    async vote (val) {
      try {
        this.$log('vote', val)
        this.voteVoting = val
        await this.$wait(1500)
        let res = await ObjectApi.vote(this.node.oid, val)
        this.$log('vote done', res)
        this.voteVoting = null
        this.voteStarted = false
      }
      catch (e) {
        this.$log('vote error', e)
        this.voteVoting = false
        this.voteStarted = false
      }
    }
  }
}
</script>
