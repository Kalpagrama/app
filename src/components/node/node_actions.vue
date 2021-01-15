<template lang="pug">
//- .row.full-width.justify-center.items-center.content-center
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
.row.full-width.q-px-sm
  div(
    :style=`{
      position: 'relative',
      height: '50px',
    }`).row.full-width.items-center.contnet-center
    .col
      .row.full-width
        .row.items-center.content-center
          q-btn(round flat dense color="grey-9" icon="reply")
          //- q-btn(round flat dense color="grey-9" icon="logout")
          //- q-btn(round flat dense color="grey-9")
            q-icon(name="logout" size="22px").rotate-270
        .col
          .row.fit.items-center.content-center.justify-start
            small.text-grey-9 {{ node.countJoints }}
    //- micronodes
    .col
      .row.full-width
        .row.items-center.content-center
          //- q-btn(round flat dense color="grey-9" icon="group_work")
          //- q-btn(round flat dense color="grey-9" icon="motion_photos_on")
          q-btn(round flat dense color="grey-9" icon="radio_button_unchecked")
            q-icon(name="workspaces" size="12px"
              :style=`{
                position: 'absolute', top: '10px',
              }`)
        .col
          .row.fit.items-center.content-center.justify-start
            small.text-grey-9 {{ node.countJoints }}
    node-vote-ball(:node="node" @click.native="voteStarted = true")
    //- joints
    .col
      .row.full-width
        .col
          .row.fit.items-center.content-center.justify-end
            small.text-grey-9 {{ node.countJoints }}
        .row.items-center.content-center
          //- q-btn(round flat dense color="grey-9" icon="fab fa-hubspot")
          q-btn(round flat dense color="grey-9")
            q-icon(name="fab fa-hubspot" :style=`{transform: 'rotate(160deg)'}`)
          //- q-btn(round flat dense color="grey-9" icon="hdr_weak")
          //- q-btn(round flat dense color="grey-9")
            q-icon(name="hdr_weak" size="24px").rotate-180
          //- q-btn(
            round flat dense color="grey-9"
            :style=`{
            }`).br
            div(:style=`{overflow: 'hidden',}`).row.fit.bg
              q-icon(name="linear_scale" size="50px").rotate-45
          //- q-btn(round flat dense color="grey-9" icon="share")
          //- q-btn(round flat dense color="grey-9")
            q-icon(name="link" size="22px")
    //- bookmarks
    .col
      .row.full-width
        .col
          .row.fit.items-center.content-center.justify-end
            small.text-grey-9 {{ node.countBookmarks }}
        .row.items-center.content-center
          q-btn(round flat dense color="grey-9" icon="bookmark_outline")
    //- ======
    //- VOTING:
    //- vote bar
    transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
      div(
        v-if="voteStarted"
        :style=`{
          position: 'absolute', top: '0px', zIndex: 900,
          height: '50px',
        }`
        ).row.full-width.b-30
    transition(enter-active-class="animated zoomIn" leave-active-class="animated zoomOut")
      div(
        v-if="voteStarted"
        :style=`{
          position: 'absolute', top: '0px', zIndex: 1000,
          height: '50px',
        }`
        ).row.full-width.items-center.content-center.justify-center
        div(
          :style=`{
            position: 'relative',
            maxWidth: '400px',
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
              v-for="r in rateMeta" :key="r.value"
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
import { EventApi } from 'src/api/event'

import nodeVoteBar from 'components/node/node_vote_bar.vue'
import nodeVoteBall from './node_vote_ball.vue'
import ClickOutside from 'vue-click-outside'

export default {
  name: 'nodeActions',
  props: {
    node: {type: Object, required: true},
    isActive: {type: Boolean},
    isVisible: {type: Boolean}
  },
  components: {
    nodeVoteBar,
    nodeVoteBall,
  },
  directives: {
    ClickOutside
  },
  data () {
    return {
      showStats: false,
      isActiveStart: 0,
      votesShow: false,
      voteStarted: false,
      voteVoting: null,
      rateOver: null,
    }
  },
  computed: {
    rateMeta () {
      return [
        {name: EventApi.verbalizeRate(0.2), value: 0, valueMin: -1, valueMax: 0.2, color: 'rgba(255,26,5,1)', colorBackground: 'rgba(255,26,5,0.5)', order: 5},
        {name: EventApi.verbalizeRate(0.4), value: 0.25, valueMin: 0.2, valueMax: 0.4, color: 'rgba(255,221,2,0.7)', colorBackground: 'rgba(255,221,2,0.5)', order: 4},
        {name: EventApi.verbalizeRate(0.6), value: 0.5, valueMin: 0.4, valueMax: 0.6, color: 'rgba(75,172,79,0.7)', colorBackground: 'rgba(75,172,79,0.5)', order: 3},
        {name: EventApi.verbalizeRate(0.8), value: 0.75, valueMin: 0.6, valueMax: 0.8, color: 'rgba(44,85,179,0.7)', colorBackground: 'rgba(44,85,179,0.5)', order: 2},
        {name: EventApi.verbalizeRate(1), value: 1, valueMin: 0.8, valueMax: 2, color: 'rgba(113,49,164,1)', colorBackground: 'rgba(113,49,164,0.5)', order: 1}
      ]
    },
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
          // handle voteStart
          this.voteStarted = false
          this.voteVoting = false
        }
      }
    }
  },
  methods: {
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
