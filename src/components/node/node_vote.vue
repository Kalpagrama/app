<template lang="pug">
div(
  :style=`{position: 'relative'}`
  ).row
  //- vote stats...
  q-dialog(
    v-model="showVotes" position="bottom")
    div(
      :style=`{
        zIndex: 9999,
        borderRadius: '10px 10px 0 0', overflow: 'hidden',
        maxWidth: $q.screen.width  > 800 ? '400px' : $q.screen.width+'px',
      }`
      ).row.full-width.b-40.q-pa-sm
      //- header
      div(
        :style=`{
          fontSize: '18px',
          textAlign: 'center',
        }`
        ).row.full-width.justify-center.q-px-md.q-py-lg
        .row.full-width.justify-center
          span.text-white.text-bold Проголосовать за
        span.text-white "{{ node.name }}"
      q-btn(
        @click="vote(a.value)"
        v-for="(a,ai) in actions" :key="ai"
        flat no-caps icon="adjust" align="left" size="lg"
        :loading="voting === a.value"
        :style=`{
          color: a.color,
        }`
        ).row.full-width.b-50.q-mb-xs
        span.text-white.text-bold.q-ml-sm {{ a.label }}
        .col
        span.text-white.text-bold {{ a.value / 10 }}
  //- vote action start
  q-btn(
    @click="voteStart()"
    round flat
    :loading="showVotes").shaking
    q-icon(name="adjust" size="30px" color="purple")
  //- vote count
  div(
    v-if="node.countVotes > 0"
    :style=`{position: 'absolute', zIndex: 10, bottom: '0px',}`).row.full-width.justify-center
    small.text-grey-9 {{ node.countVotes }}
</template>

<script>
import { NodeApi } from 'src/api/node'

export default {
  name: 'nodeVote',
  props: ['node'],
  data () {
    return {
      voting: false,
      votingAgain: false,
      voteMenuOpened: false,
      showVotes: false,
    }
  },
  computed: {
    actions () {
      return [
        {id: 1, label: this.$t('nodeVote100', 'Прямо в точку!'), value: 100, color: '#850e3f'},
        {id: 0.7, label: this.$t('nodeVote70', 'Близко'), value: 70, color: '#8f4067'},
        {id: 0.5, label: this.$t('nodeVote50', 'Где-то рядом'), value: 50, color: '#99718f'},
        {id: 0.3, label: this.$t('nodeVote30', 'Ну такое...'), value: 30, color: '#a4a9bc'},
        {id: 0.1, label: this.$t('nodeVote0', 'Очень далеко'), value: 0, color: '#aedce6'},
      ]
    },
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
        this.showVotes = true
        // if (currentUser.oid === this.node.author.oid) {
        //   this.$q.notify({type: 'negative', position: 'top', message: 'Cant vote for your node!'})
        // }
        // else {
        //   this.showVotes = true
        // }
      }
    },
    async vote (val) {
      try {
        this.$log('vote start', this.node.oid, val)
        this.voting = val
        await this.$wait(500)
        let res = await NodeApi.nodeVote(this.node.oid, val)
        this.$log('vote done', res)
        this.voting = false
        this.votingAgain = false
        this.showVotes = false
        this.showVotearea = false
        this.$emit('done')
      }
      catch (e) {
        this.$log('vote error', e)
        this.$q.notify({type: 'negative', position: 'top', message: e.toString()})
        this.voting = false
        this.votingAgain = false
        this.showVotes = false
        this.showVotearea = false
      }
    }
  }
}
</script>
