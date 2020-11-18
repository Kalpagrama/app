<template lang="pug">
div(
  :style=`{
    position: 'relative',
    height: '44px',
  }`
  ).row.full-width.items-center.content-center
  //- vote stats
  q-dialog(
    v-model="voteStatsShow" position="bottom")
    node-vote-bar-stats(:node="node" :rateStat="node.rateStat" :rateMeta="rateMeta")
  //- vote actions
  q-dialog(
    v-model="voteActionsShow" position="bottom")
    div(
      :style=`{
        zIndex: 9999,
        borderRadius: '10px 10px 0 0', overflow: 'hidden',
        maxWidth: $q.screen.width  > 800 ? '400px' : $q.screen.width+'px',
        background: 'rgba(40,40,40,0.95)'
      }`
      ).row.full-width.q-py-sm.q-px-xl
      //- header
      div(
        :style=`{
          fontSize: '18px',
          textAlign: 'center',
        }`
        ).row.full-width.justify-center.q-px-md.q-py-lg
        .row.full-width.justify-center
          span.text-white.text-bold Как близко ядро к сути?
        //- span.text-white "{{ node.name }}"
      //- icon="adjust"
      q-btn(
        @click="vote(a.value)"
        v-for="(a,ai) in rateMeta" :key="a.value"
        flat no-caps
        align="left" size="lg"
        :loading="voteAction === a.value"
        :style=`{
          color: 'white',
          background: a.colorBackground,
          height: '60px',
        }`
        ).row.full-width.b-50.q-mb-sm
        span.text-white.text-bold.q-ml-sm {{ a.name }}
      div(
        :style=`{
          height: '100px',
          textAlign: 'center',
        }`
        ).row.full-width.items-center.content-center.justify-center
        span(:style=`{fontSize: '18px',}`).text-white.text-bold {{ node.name }}
  //- TODO: snake svg
  //- svg(width="400" height="22" viewBox="0 0 400 22" fill="none" xmlns="http://www.w3.org/2000/svg")
  //-   path(d=`
  //-     M165.989 9H2C0.895431 9 0 9.89543 0 11C0 12.1046 0.895435 13 2 13H165.989C171.909 13
  //-     177.742 14.4259 182.995 17.1572C193.654 22.7001 206.346 22.7001 217.005 17.1572C222.258
  //-     14.4259 228.091 13 234.011 13H398C399.105 13 400 12.1046 400 11C400 9.89543 399.105 9 398
  //-     9H234.011C228.091 9 222.258 7.57406 217.005 4.84282C206.346 -0.700084 193.654 -0.700084
  //-     182.995 4.84282C177.742 7.57406 171.909 9 165.989 9Z` fill="black")
  //- svg(width="400px" height="100px" xmlns="http://www.w3.org/2000/svg").bg
    path(d="m 0 50, h 100, v -50, h100, v50, h100, v50, h-100, v-10, h-100, v-10, h-100 z" stroke="red" fill="black")
  div(
    v-if="!node.rateUser || node.rateStat.length === 0"
    @click="voteStart"
    :style=`{
      position: 'relative',
      height: '5px',
      marginTop: '13px',
      borderRadius: '10px', overflow: 'hidden',
      background: 'rgb(2,0,36)',
      background: 'linear-gradient(90deg, rgba(255,26,5,1) 0%, rgba(255,221,2,0.7) 25%, rgba(75,172,79,0.7) 50%, rgba(44,85,179,0.7) 75%, rgba(113,49,164,1) 100%)'
    }`).row.full-width
  div(v-if="!node.rateUser || node.rateStat.length === 0").row.full-width.justify-center
    small.text-grey-6 {{node.rateStat.length === 0 ? 'Нет голосов' : 'Проголосовать'}}
  div(
    v-if="node.rateUser && node.rateStat && node.rateStat.length > 0"
    @click="voteStatsShow = true"
    :style=`{
      marginTop: '13px',
    }`
    ).row.full-width.justify-center
    div(
      :style=`{
        position: 'relative',
        height: '5px',
        borderRadius: '5px',
        overflow: 'hidden'
      }`
      ).row.full-width
      div(
        v-for="(s,si) in node.rateStat" :key="si"
        v-if="s.percent > 0"
        :style=`{
          width: s.percent+'%',
          background: rateMeta[si].color,
        }`).full-height
    div().row.full-width.justify-center
      small.text-grey-6 {{ votesCount }}
</template>

<script>
import { ObjectApi } from 'src/api/object'
import { RxCollectionEnum } from 'src/system/rxdb'
import nodeVoteBarStats from './node_vote_bar_stats.vue'

export default {
  name: 'nodeVoteBar',
  components: {nodeVoteBarStats},
  props: ['node'],
  data () {
    return {
      voteAction: false,
      voteActionsShow: false,
      voteStatsShow: false,
    }
  },
  computed: {
    votesCountRaw () {
      return this.node.rateStat.reduce((acc, val) => {
        acc += val.count
        return acc
      }, 0)
    },
    votesCount () {
      // TODO: impl kK 1,000,000
      return this.votesCountRaw + ' голосов'
    },
    rateMeta () {
      return [
        {name: 'Очень далеко', value: 0, color: 'rgba(255,26,5,1)', colorBackground: 'rgba(255,26,5,0.5)'},
        {name: 'Далеко', value: 0.25, color: 'rgba(255,221,2,0.7)', colorBackground: 'rgba(255,221,2,0.5)'},
        {name: 'Где-то рядом', value: 0.5, color: 'rgba(75,172,79,0.7)', colorBackground: 'rgba(75,172,79,0.5)'},
        {name: 'Близко', value: 0.75, color: 'rgba(44,85,179,0.7)', colorBackground: 'rgba(44,85,179,0.5)'},
        {name: 'Прямо в точку!', value: 1, color: 'rgba(113,49,164,1)', colorBackground: 'rgba(113,49,164,0.5)'}
      ]
    }
  },
  methods: {
    voteStart () {
      this.$log('voteStart')
      // if its me
      let currentUser = this.$store.getters.currentUser()
      if (currentUser.profile.role === 'GUEST') {
        this.$router.push('/auth/sign-in')
      }
      else {
        this.voteActionsShow = true
      }
    },
    async vote (val) {
      try {
        this.$log('vote start', this.node.oid, val)
        this.voteAction = val
        await this.$wait(250)
        let res = await ObjectApi.vote(this.node.oid, val)
        this.$log('vote done', res)
        this.voteAction = false
        this.voteActionsShow = false
      }
      catch (e) {
        this.$log('vote error', e)
        this.$q.notify({type: 'negative', position: 'top', message: e.toString()})
        this.voteAction = false
        this.voteActionsShow = false
      }
    }
  }
}
</script>
