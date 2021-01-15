<template lang="pug">
div(
  :style=`{
    position: 'relative',
    width: '40px',
  }`
  ).row.items-center.content-center.justify-center
  //- vote btn start
  q-btn(
    @click="voteStart"
    round flat dense color="white"
    :style=`{
      position: 'relative',
      borderRadius: '50%',
    }`)
    img(
      src="~/assets/vote.png"
      :style=`{
        zIndex: 10,
        width: '24px',
        height: '24px',
        opacity: 0.6,
        filter: 'grayscale(20%)'
      }`)
    div(
      v-if="rateUser"
      :style=`{
        position: 'absolute', zIndex: 300,
        top: '5px',
        left: '5px',
        width: '24px',
        height: '24px',
        //- opacity: 0.6,
        background: rateUser.colorBackground,
        borderRadius: '50%',
      }`)
  //- voteCounts
  div(
    :style=`{
      position: 'absolute', zIndex: 100,
      bottom: '-10px',
    }`
    ).row.full-width.justify-center
    small.text-grey-9 1231
</template>

<script>
import { EventApi } from 'src/api/event'

export default {
  name: 'nodeVoteBall',
  props: ['node'],
  data () {
    return {
      voteStarted: false,
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
    rateUser () {
      if (this.nodeIsMine) {
        return this.rateMeta.find(r => {
          return r.value >= this.node.rate && r.value < this.node.rate
        })
      }
      else {
        if (this.node.rateUser) {
          return this.rateMeta.find(r => r.value === this.node.rateUser)
        }
        else {
          // return null
          return this.rateMeta.find(r => {
            return r.value >= this.node.rate && r.value < this.node.rate
          })
        }
      }
    },
    nodeIsMine () {
      return this.node.author.oid === this.$store.getters.currentUser().oid
    }
  },
  methods: {
    voteStart () {
      this.$log('voteStart')
      if (this.voteStarted) {
        this.voteStarted = false
      }
      else {
        this.voteStarted = true
      }
    }
  }
}
</script>
