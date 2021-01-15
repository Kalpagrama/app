<template lang="pug">
div(
  :style=`{
    position: 'relative',
    width: '40px',
  }`
  ).row.items-center.content-center.justify-center
  //- btn start...
  div(
    :style=`{
      position: 'relative',
      width: '34px', height: '34px',
      borderRadius: '50%',
      transform: 'blur(10px)',
    }`
    ).row.items-center.content-center.justify-center
    //- rainbow circle
    div(
      v-if="true"
      :style=`{position: 'relative'}`).row.fit.items-center.content-center.justify-center
      div(
        v-for="(r,ri) in rateMeta" :key="ri"
        :style=`{
          position: 'absolute', zIndex: 100+ri,
          width: 100-(6*ri+1)+'%',
          height: 100-(6*ri+1)+'%',
          borderRadius: '50%',
          background: rateMeta[ri].colorBackground,
        }`)
    //- rateMax
    div(
      :style=`{
        position: 'absolute', zIndex: 300,
        width: '70%', minWidth: '70%', maxWidth: '70%',
        height: '70%', minHeight: '70%', maxHeight: '70%',
        borderRadius: '50%',
        padding: '4px',
      }`
      ).row.items-center.content-center.justify-center.b-30
      div(
        :style=`{
          borderRadius: '50%',
          background: rateMeta.find(r => node.rate > r.valueMin && node.rate < r.valueMax).color,
        }`
        ).row.fit
    //- rateUser
    div(
      v-if="node.rateUser >= 0"
      :style=`{
        position: 'absolute', zIndex: 300,
        //- top: '-4px', right: '-4px',
        top: '12px', left: '-16px',
        width: '10px', height: '10px',
        borderRadius: '50%',
        background: rateMeta.find(r => node.rateUser > r.valueMin && node.rateUser < r.valueMax).colorBackground,
      }`
      ).row
    //- voteCounts
    div(
      :style=`{
        position: 'absolute', zIndex: 100,
        top: '9px', right: '-39px',
      }`
      ).row.full-width.justify-start
      small.text-grey-9 {{ node.countVotes }}
    div(
      :style=`{
        position: 'absolute', zIndex: 100,
        bottom: '-18px',
      }`
      ).row.full-width.justify-center
      small(:style=`{whiteSpace: 'nowrap'}`).text-grey-9 {{ rateMeta.find(r => node.rate > r.valueMin && node.rate < r.valueMax).name }}
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
