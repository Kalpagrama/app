<template lang="pug">
div(
  :style=`{
    position: 'relative',
    overflow: 'hidden',
  }`
  ).row.full-width.justify-center
  //- tint
  div(
    :style=`{
      position: 'absolute', zIndex: 300,
    }`
    ).row.fit.items-center.content-center.b-30.q-px-xl
    q-btn(
      push no-caps color="green"
      ).full-width Go inside
  //- vote stats
  q-dialog(
    v-model="voteStatsShow"
    position="bottom")
    vote-stats(
      :node="node"
      :style=`{}`
      @voteAgain="voteAgain"
      @close="voteStatsShow = false")
  div(
    :style=`{
      position: 'relative',
      maxWidth: 500+'px',
    }`
    ).row.full-width.items-center.content-center.justify-between.q-pa-sm
    //- div().col
    //- wrapper of 3 main actions
    //- div(:style=`{marginLeft: '-6px',}`).row
    //- share
    .row.items-center.content-center.q-px-sm
      kalpa-share(type="node" :item="node" :headerText="$tt('Share')")
      //- q-btn(
        round flat color="grey-9")
        q-icon(name="logout").rotate-270
      small(:style=`{marginLeft: '-8px',}`).text-grey-9 {{ node.countStat.countViews - 1 }}
    //- save
    .row.items-center.content-center.q-px-sm
      kalpa-save(
        color="grey-9"
        :dense="false"
        :item="node"
        :isActive="isActive")
      small(:style=`{marginLeft: '-8px',}`).text-grey-9 {{ node.countStat.countViews }}
    //- discuss link
    .row.items-center.content-center.q-px-sm
      //- q-btn(
        v-if="node.items.length === 1"
        :to="'/graph/'+node.oid"
        round flat color="grey-9")
        q-icon(name="far fa-comment" size="24px" :style=`{transform: 'scaleX(-1)'}`)
      q-btn(
        round flat color="grey-9")
        q-icon(name="logout" ).rotate-90
      small(:style=`{marginLeft: '-4px',}`).text-grey-9 {{ node.countStat.countJoints }}
    .row.items-center.content-center.q-px-sm
      div(:style=`{width: '42px',}`)
    //- vote
    div(
      :class=`{
        'full-width': votesShow,
      }`
      :style=`{
        position: 'absolute', top: '8px', right: '18px', zIndex: 100,
      }`
      ).row.justify-end
      .col
        transition(enter-active-class="animated slideInRight" leave-active-class="animated slideOutRight")
          vote-options(
            v-if="votesShow"
            :node="node"
            @voted="votesShow = false")
      q-btn(
        v-if="votesShow"
        flat color="white" icon="clear"
        @click="votesShow = false"
        :style=`{
          width: '40px', height: '40px',
        }`)
      div(
        v-if="!votesShow"
        ).row.items-center.content-center
        .row.items-center.content-center
          .row.full-width.justify-end
            div(
              v-if="node.rateUser !== null"
              :style=`{
                width: '10px', height: '10px', borderRadius: '5px',
                background: $rateMeta.find(r => node.rateUser >= r.valueMin && node.rateUser < r.valueMax).color,
              }`)
          .row.full-width.justify-end
            small(
              v-if="node.rateUser !== null"
              :style=`{lineHeight: 1.5,marginRight: '2px'}`).text-white {{ node.countVotes }}
        vote-ball(
          :node="node"
          @click.native="voteStart()")
    //- vote description
    div(:style=`{height: '20px'}`).row.full-width
      transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
        div(
          v-if="votesShow"
          ).row.full-width.justify-center
          small.text-white Насколько близко к сути ?
</template>

<script>
import voteBall from './vote_ball.vue'
import voteOptions from './vote_options.vue'
import voteStats from './vote_stats.vue'

export default {
  name: 'nodeActionsRight',
  props: ['node', 'isActive'],
  components: {
    voteBall,
    voteOptions,
    voteStats
  },
  data () {
    return {
      votesShow: false,
      voteStatsShow: false,
    }
  },
  watch: {
    isActive: {
      immediate: true,
      handler (to, from) {
        if (to) {
        }
        else {
          this.votesShow = false
        }
      }
    }
  },
  methods: {
    voteStart () {
      this.$log('voteStart')
      if (this.$store.getters.currentUser().profile.role === 'GUEST') {
        let authGuard = {
          message: 'Чтобы проголосать и увидеть автора и статистику голосований, войдите в аккаунт.'
        }
        this.$store.commit('ui/stateSet', ['authGuard', authGuard])
      }
      else {
        // shot stats if user has voted already
        if (this.node.rateUser || (this.node.author.oid === this.$store.getters.currentUser().oid)) {
          this.voteStatsShow = true
        }
        // show votes to vote...
        else {
          this.votesShow = true
        }
      }
    },
    async voteAgain () {
      this.$log('voteAgain')
      if (this.node.author.oid === this.$store.getters.currentUser().oid) return
      this.voteStatsShow = false
      await this.$wait(200)
      this.votesShow = true
    },
  }
}
</script>
