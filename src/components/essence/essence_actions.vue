<template lang="pug">
.row.full-width.justify-center.q-px-sm
  //- vote stats
  q-dialog(
    v-model="data.voteStatsShow" position="bottom")
    essence-vote-stats(
      :essence="essence"
      :style=`{
      height: Math.min(500, $q.screen.height)+'px',
    }`
      @voteAgain="voteAgain"
      @renode="renode"
      @close="data.voteStatsShow = false")
  q-dialog(
    v-model="data.itemEditorShow"
    :maximized="false"
    position="standard")
    essence-editor(
      :item="essence"
      :publish="true"
      @close="data.itemEditorShow = false")
  div(
    :style=`{
    position: 'relative',
    // height: '66px',
    maxWidth: '500px',
  }`).row.full-width.items-start.contnet-start
    //- share
    .col
      .row.full-width
        .row.items-center.content-center
          kalpa-share(:item="essence" :itemState="data" :headerText="$t('Share')")
        .col
          .row.fit.items-center.content-center.justify-start
            small.text-grey-9 {{ essence.countStat.countShares || '' }}
    // content
    div(
      v-if="essence.type === 'NODE'"
    ).col
      .row.full-width
        .row.items-center.content-center
          q-btn(
            round flat color="grey-9"
            @click="contextGo()")
            q-tooltip(v-if="$q.platform.is.desktop" dense dark) {{$t('Context')}}
            q-icon(name="select_all" size="22px")
    // Vote ball
    essence-vote-ball(v-if="essence.type.in('JOINT', 'NODE', 'BLOCK')"
      :essence="essence"
      @click.native="nodeVoteBallClick"
      ).q-mt-xs.q-mx-lg
    //- joints/chains
    router-link(
      v-if="essence.type === 'NODE'"
      :to="'/graph/'+essence.oid"
    ).col
      .row.full-width
        .col
          .row.fit.items-center.content-center.justify-end
            small.text-grey-9 {{ essence.countStat.countJoints || '' }}
        .row.items-center.content-center
          q-btn(round flat color="grey-9" icon="hub")
            q-tooltip(v-if="$q.platform.is.desktop" dense dark) {{$t('Graph')}}
            //q-icon(name="fas fa-link" size="20px")
    //- bookmarks
    .col
      .row.full-width
        .col
          .row.fit.items-center.content-center.justify-end
            small.text-grey-9 {{ essence.countStat.countBookmarks || '' }}
        .row.items-center.content-center
          kalpa-save(
            :item="essence" :itemState="data" :isActive="isActive" inactiveColor="grey-9")
    //- ======
    //- VOTING:
    //- vote bar
    transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
      div(
        v-if="data.voteStarted"
        :style=`{
        position: 'absolute', top: '0px', zIndex: 900, left: '0px',
        height: '50px',
        background: nodeBackgroundColor,
        //- background: 'rgb(35,35,35)',
      }`
      ).row.full-width
    transition(enter-active-class="animated zoomIn" leave-active-class="animated zoomOut")
      div(
        v-if="data.voteStarted"
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
            @click="data.voteStarted = false"
            flat dense color="grey-8" no-caps
          :style=`{
            position: 'absolute', zIndex: 2000,
            bottom: '-46px',
          }`).full-width.b-30
            small.text-grey-8 {{$t('Cancel')}}
          //- vote rates
          div(
            :style=`{
            borderRadius: '10px',
            overflow: 'hidden',
          }`
          ).row.fit.items-center.content-center
            div(
              v-for="r in $rateMeta" :key="r.value"
              @mouseover="data.rateOver = r.value"
              :style=`{
              background: data.rateOver === r.value ? r.color : r.colorBackground,
            }`
            ).col.full-height
              div(
                @click="vote(r.value)"
              ).row.fit.items-center.content-center.justify-center.cursor-pointer
                q-spinner(
                  v-if="data.voteVoting === r.value"
                  color="white" size="10px")
                small(
                  v-else
                  :style=`{fontSize: '9px', pointerEvents: 'none', userSelect: 'none'}`).text-white {{ r.name }}
</template>

// этот элемент показывается в virtual scroll и не может иметь состояния!!! data - запрещено! И во вложенных - тоже!!!
<script>
import { ObjectApi } from 'src/api/object'
import essenceVoteBall from 'src/components/essence/essence_vote_ball.vue'
import essenceVoteStats from './essence_actions/vote_stats.vue'
import essenceEditor from 'src/components/kalpa_item/item_editor/essence_editor'
import { assert } from 'src/system/common/utils'
export default {
  name: 'essenceActions',
  props: {
    essence: { type: Object, required: true },
    itemState: {
      type: Object,
      default () {
        return {}
      }
    },
    nodeBackgroundColor: {type: String, default: 'rgb(30,30,30)'},
    nodeActionsColor: {type: String, default: 'rgb(200,200,200)'},
    isActive: { type: Boolean },
    isVisible: { type: Boolean }
  },
  components: {
    essenceVoteBall,
    essenceVoteStats,
    essenceEditor,
  },
  computed: {
    data() {
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      assert(this.itemState)
      let key = this.$options.name
      if (!this.itemState[key]) {
        this.$set(this.itemState, key, {
          showStats: false,
          isActiveStart: 0,
          votesShow: false,
          voteStarted: false,
          voteStatsShow: false,
          itemEditorShow: false,
          voteVoting: null,
          rateOver: null,
        })
      }
      return this.itemState[key]
    }
  },
  watch: {
    isActive: {
      async handler (to, from) {
        if (this.$store.getters.isGuest) return
        if (to) {
          this.data.isActiveStart = Date.now()
        } else if (this.data.isActiveStart) {
          let statValue = Date.now() - this.data.isActiveStart
          // this.$log('statValue', statValue)
          let stat = await ObjectApi.updateStat(this.essence.oid, 'VIEWED_TIME', statValue)
          this.data.isActiveStart = 0
          // handle voteStart
          this.data.voteStarted = false
          this.data.voteVoting = false
        }
      }
    }
  },
  methods: {
    contextGo () {
      this.$log('contextGo')
      this.$store.commit('ui/stateSet', ['nodeOnContent', this.essence.oid])
      this.$router.push('/content/' + this.essence.items[0].layers[0].contentOid)
    },
    nodeVoteBallClick () {
      this.$log('nodeVoteBallClick', this.essence.rateUser)
      if (this.$store.getters.isGuest) {
        let authGuard = {
          message: 'Чтобы проголосать и увидеть статистику голосований войдите'
        }
        this.$store.commit('ui/stateSet', ['authGuard', authGuard])
      } else {
        if (this.essence.rateUser !== null || this.essence.author.oid === this.$store.getters.currentUser.oid) {
          this.data.voteStatsShow = true
        } else {
          this.data.voteStarted = true
        }
      }
    },
    async voteAgain () {
      this.$log('voteAgain')
      if (this.essence.author.oid === this.$store.getters.currentUser.oid) return
      this.data.voteStatsShow = false
      // await this.$wait(200)
      this.data.voteStarted = true
    },
    async renode() {
      this.data.voteStatsShow = false
      await this.$wait(200)
      this.data.itemEditorShow = true
    },
    async vote (val) {
      try {
        this.$log('vote', val)
        this.data.voteVoting = val
        // await this.$wait(1500)
        let res = await ObjectApi.vote(this.essence.oid, val)
        this.$ym('USER_VOTED')
        this.$log('vote done', res)
        this.data.voteVoting = null
        this.data.voteStarted = false
      } catch (e) {
        this.$log('vote error', e)
        this.data.voteVoting = false
        this.data.voteStarted = false
      }
    }
  }
}
</script>
