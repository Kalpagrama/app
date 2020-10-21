<template lang="pug">
div(
  :style=`{position: 'relative'}`
  ).row.items-center.content-center
  q-dialog(
    v-model="showVotes" position="bottom")
    div(
      :style=`{
        zIndex: 9999,
        borderRadius: '10px 10px 0 0', overflow: 'hidden',
        maxWidth: $q.screen.width  > 800 ? '400px' : $q.screen.width+'px',
      }`
      ).row.full-width.b-40
      q-btn(
        @click="vote(a.value)"
        v-for="(a,ai) in actions" :key="ai"
        flat no-caps icon="adjust" align="left" size="lg"
        :loading="voting === a.value"
        :style=`{
          color: a.color,
        }`
        ).full-width
        span.text-white.text-bold.q-ml-sm {{ a.label }}
  q-btn(
    @click="voteStart()"
    round flat
    :loading="showVotes").shaking
    q-icon(name="adjust" size="30px" color="green")
</template>

<script>
import { NodeApi } from 'src/api/node'

export default {
  name: 'nodeVote',
  props: ['joint'],
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
    }
  },
  methods: {
    voteStart () {
      this.$log('voteStart')
      let currentUser = this.$store.getters.currentUser()
      if (currentUser.profile.role === 'GUEST') {
        this.$router.push('/auth/sign-in')
      }
      else {
        // TODO: check joint authors.includes(currentUser.oid)
        // if (currentUser.oid === this.joint.)
        this.showVotes = true
      }
    },
    async vote (val) {
      try {
        this.$log('vote start', this.joint.oid, val)
        this.voting = val
        await this.$wait(500)
        let res = await NodeApi.nodeVote(this.joint.oid, val)
        this.$log('vote done', res)
        this.voting = false
        this.votingAgain = false
        this.showVotes = false
        this.showVotearea = false
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
