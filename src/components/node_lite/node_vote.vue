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
  @click="voteStart()"
  flat color="green"
  :loading="voting").voter
  span(:style=`{fontSize: '20px'}`).text-bold.text-grey-4 78
  q-icon(name="blur_on" size="30px" color='green')
</template>

<script>
import { NodeApi } from 'src/api/node'

export default {
  name: 'nodeVote',
  props: ['node'],
  data () {
    return {
      voting: false,
    }
  },
  methods: {
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
        },
        actions: [
          {id: 1, label: this.$t('nodeVote100', 'Прямо в точку!'), icon: '😝', value: 100},
          {id: 0.7, label: this.$t('nodeVote70', 'Близко'), icon: '😌', value: 70},
          {id: 0.5, label: this.$t('nodeVote50', 'Где-то рядом'), icon: '🤔', value: 50},
          {id: 0.3, label: this.$t('nodeVote30', 'Ну такое...'), icon: '🤥', value: 30},
          {id: 0, label: this.$t('nodeVote0', 'Очень далеко'), icon: '🥵', value: 0},
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
        this.$log('vote start', val)
        this.voting = true
        await this.$wait(500)
        let res = await NodeApi.nodeVote(this.node.oid, val)
        this.$log('vote done', res)
        this.voting = false
      }
      catch (e) {
        this.$log('vote error', e)
        this.voting = false
      }
    }
  }
}
</script>
