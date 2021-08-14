<template lang="pug">
div(
  :style=`{
    position: 'relative',
    width: '40px',
    minWidth: '40px', maxWidth: '40px',
    height: '40px',
    minHeight: '40px', maxHeight: '40px',
  }`
  ).row.items-center.content-center.justify-center
  //- btn start...
  div(
    :style=`{
      position: 'relative',
      width: '34px', height: '34px',
      minWidth: '34px', maxWidth: '34px',
      minHeight: '34px', maxHeight: '34px',
      borderRadius: '50%',
      //- transform: 'blur(10px)',
    }`
    ).row.items-center.content-center.justify-center.cursor-pointer
    //- rainbow circle
    div(
      :style=`{
        position: 'relative',
        opacity: showRainbow ? 1 : 0,
      }`).row.fit.items-center.content-center.justify-center
      div(
        v-for="(r,ri) in $rateMeta" :key="ri"
        :style=`{
          position: 'absolute', zIndex: 100+ri,
          width: 100-(6*ri+1)+'%',
          height: 100-(6*ri+1)+'%',
          borderRadius: '50%',
          background: $rateMeta[ri].colorBackground,
        }`)
    //- rateMax
    div(
      v-if="showRateMax"
      :style=`{
        position: 'absolute', zIndex: 300,
        width: '70%', minWidth: '70%', maxWidth: '70%',
        height: '70%', minHeight: '70%', maxHeight: '70%',
        borderRadius: '50%',
        padding: '4px 4px',
        opacity: showRateMax ? 1 : 0,
      }`
      ).row.items-center.content-center.justify-center.b-30
      div(
        v-if="essence.rateUser !== null"
        :style=`{
          borderRadius: '50%',
          background: rateMax.color,
        }`
        ).row.fit
    //- rateUser
    div(
      v-if="showRateUser && essence.rateUser !== null"
      :style=`{
        position: 'absolute', zIndex: 300,
        //- top: '-4px', right: '-4px',
        top: '12px', left: '-16px',
        width: '10px', height: '10px',
        borderRadius: '50%',
        background: $rateMeta.find(r => essence.rateUser >= r.valueMin && essence.rateUser < r.valueMax).colorBackground,
      }`
      ).row
    //- voteCounts
    div(
      v-if="showRateCounts"
      :style=`{
        position: 'absolute', zIndex: 100,
        top: '9px', right: '-39px',
      }`
      ).row.full-width.justify-start
      small.text-grey-9 {{ essence.countStat.countVotes }}
    //- voteName
    div(
      v-if="showRateName"
      :style=`{
        position: 'absolute', zIndex: 100,
        bottom: '-18px',
      }`
      ).row.full-width.justify-center
      //- small(:style=`{whiteSpace: 'nowrap'}`).text-grey-9 {{ $rateMeta.find(r => essence.rate >= r.valueMin && essence.rate < r.valueMax).name }}
      small(:style=`{whiteSpace: 'nowrap'}`).text-grey-9 {{ essence.rateUser !== null ? rateMax.name : 'Проголосуйте' }}
</template>

<script>
export default {
  name: 'essenceVoteBall',
  props: {
    essence: {type: Object, required: true},
    showRateCounts: {type: Boolean, default: true},
    showRateUser: {type: Boolean, default: true},
    showRateMax: {type: Boolean, default: true},
    showRateName: {type: Boolean, default: true},
    showRainbow: {type: Boolean, default: true}
  },
  data () {
    return {
    }
  },
  computed: {
    essenceIsMine () {
      return this.essence.author.oid === this.$store.getters.currentUser.oid
    },
    rateMax () {
      // $rateMeta.find(r => essence.rate >= r.valueMin && essence.rate < r.valueMax)
      let percentMax = null
      let percentMaxIndex = 0
      this.essence.rateStat.map((r, ri) => {
        if (percentMax) {
          if (r.percent > percentMax) {
            percentMax = r.percent
            percentMaxIndex = ri
          }
        }
        else {
          percentMaxIndex = ri
        }
      })
      let rateMax = this.$rateMeta[percentMaxIndex]
      return rateMax
    }
  },
  methods: {
  }
}
</script>
