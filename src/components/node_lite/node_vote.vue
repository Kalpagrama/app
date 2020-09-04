<style lang="sass" scoped>
.voter
  &:hover
    animation: shake 0.82s cubic-bezier(.36,.07,.19,.97) both
    transform: translate3d(0, 0, 0)
    backface-visibility: hidden
    perspective: 1000px
    color: #4caf50 !important
@keyframes shake
  10%, 90%
    transform: translate3d(-1px, 0, 0)
    color: #4caf50 !important
  20%, 80%
    transform: translate3d(2px, 0, 0)
    color: #4caf50 !important
  30%, 50%, 70%
    transform: translate3d(-4px, 0, 0)
    color: #4caf50 !important
  40%, 60%
    transform: translate3d(4px, 0, 0)
    color: #4caf50 !important
</style>

<template lang="pug">
q-btn(
  @click="voteStart2()"
  flat color="green"
  :loading="voting").voter
  span(:style=`{fontSize: '20px'}`).text-bold.text-grey-4.q-mr-sm {{ nodeFull ? nodeFull.rate*100 : '' }}
  q-icon(name="adjust" size="30px" color='green')
  q-menu(
    ref="nodeVoteMenu"
    anchor="top right" self="bottom right" :offset="[8,16]")
    div(
      v-if="nodeFull && !nodeFull.rateUser"
      :style=`{
        position: 'relative',
        maxWidth: '240px',
        borderRadius: '10px', overflow: 'hidden',
      }`).row.full-width.b-50
      q-btn(
        v-for="a in actions" :key="id"
        @click="vote(a.value)"
        flat color="white" no-caps size="lg" align="right"
        ).full-width.cursor-pointer.voter
        span(:style=`{fontSize: '18px'}`).text-bold {{ a.label }}
        q-icon(
          v-if="voting !== a.value" name="adjust" size="30px" :style=`{color: a.color, marginRight: '12px'}`).q-ml-md
        q-spinner(
          v-if="voting === a.value" size="30px" :style=`{color: a.color, marginRight: '12px'}`).q-ml-md
    div(
      v-if="nodeFull && nodeFull.rateUser"
      :style=`{
        width: '180px', height: '200px',
        borderRadius: '10px', overflow: 'hidden',
      }`).row.items-start.content-start.b-50.q-pa-md
      .row.full-width.items-center.content-center
        span(:style=`{fontSize: '18px'}`).text-white.text-bold Your vote:
        span(:style=`{fontSize: '26px'}`).text-white.text-bold.q-mx-sm {{ nodeFull.rateUser }}
</template>

<script>
import { NodeApi } from 'src/api/node'

export default {
  name: 'nodeVote',
  props: ['node', 'nodeFull'],
  data () {
    return {
      voting: false,
    }
  },
  computed: {
    actions () {
      return [
        {id: 1, label: this.$t('nodeVote100', 'Прямо в точку!'), value: 100, color: '#850e3f'},
        {id: 0.7, label: this.$t('nodeVote70', 'Близко'), value: 70, color: '#8f4067'},
        {id: 0.5, label: this.$t('nodeVote50', 'Где-то рядом'), value: 50, color: '#99718f'},
        {id: 0.3, label: this.$t('nodeVote30', 'Ну такое...'), value: 30, color: '#a4a9bc'},
        {id: 0, label: this.$t('nodeVote0', 'Очень далеко'), value: 0, color: '#aedce6'},
      ]
    }
  },
  methods: {
    voteStart2 () {
      this.$log('voteStart2')
    },
    voteStart () {
      this.$log('voteStart')
      this.$store.commit('ui/stateSet', ['showMobileNavigation', false])
      this.$q.bottomSheet({
        dark: true,
        title: this.node.name,
        persistent: false,
        seamless: false,
        grid: false,
        style: {
          borderRadius: '10px 10px 0 0',
          overflow: 'hidden',
          paddingBottom: '50px',
          fontSize: '18px',
        },
        actions: [
          // {id: 1, label: this.$t('nodeVote100', 'Прямо в точку!'), icon: '😝', value: 100},
          // {id: 0.7, label: this.$t('nodeVote70', 'Близко'), icon: '😌', value: 70},
          // {id: 0.5, label: this.$t('nodeVote50', 'Где-то рядом'), icon: '🤔', value: 50},
          // {id: 0.3, label: this.$t('nodeVote30', 'Ну такое...'), icon: '🤥', value: 30},
          // {id: 0, label: this.$t('nodeVote0', 'Очень далеко'), icon: '🥵', value: 0},
          {id: 1, label: this.$t('nodeVote100', 'Прямо в точку!'), value: 100},
          {id: 0.7, label: this.$t('nodeVote70', 'Близко'), value: 70},
          {id: 0.5, label: this.$t('nodeVote50', 'Где-то рядом'), value: 50},
          {id: 0.3, label: this.$t('nodeVote30', 'Ну такое...'), value: 30},
          {id: 0, label: this.$t('nodeVote0', 'Очень далеко'), value: 0},
        ]
      })
        .onOk(action => {
          this.$log('voteStart onOk', action)
          this.vote(action.value)
        })
        .onDismiss(() => {
          this.$log('voteStart onDismiss')
          this.$store.commit('ui/stateSet', ['showMobileNavigation', true])
        })
        .onCancel(() => {
          this.$log('voteStart onCancel')
        })
    },
    async vote (val) {
      try {
        this.$log('vote start', this.node.oid, val)
        this.voting = val
        await this.$wait(500)
        let res = await NodeApi.nodeVote(this.node.oid, val)
        this.$log('vote done', res)
        this.voting = false
        if (this.$refs.nodeVoteMenu) this.$refs.nodeVoteMenu.hide()
      }
      catch (e) {
        this.$log('vote error', e)
        this.voting = false
      }
    }
  }
}
</script>
