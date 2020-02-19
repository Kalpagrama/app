<template lang="pug">
div(
  :style=`{
    position: 'absolute', zIndex: 1000, paddingBottom: '30px',
    borderRadius: '10px', overflow: 'hidden', background: 'rgba(0,0,0,0.5)'}`
    ).row.fit.items-end.content-end.justify-center
  //- vote number
  div(
    :style=`{fontSize: 10*(voteValue/10) < 50 ? 50+'px' : 10*(voteValue/10)+'px'}`
  ).row.full-width.justify-center.items-end.text-bold.text-white {{ voteText }}
  //- vote text
  .row.full-width.justify-center
    span(:style=`{fontSize: '50px'}`
      ).text-bold.text-white.text-center {{ voteLabel }}
</template>

<script>
export default {
  name: 'voteTint',
  props: ['voteValue'],
  data () {
    return {

    }
  },
  computed: {
    voteText () {
      let v = (this.voteValue / 10).toFixed(1)
      let arr = v.split('.')
      return arr[0] + ',' + arr[1]
    },
    voteLabel () {
      let v = this.voteValue
      if (v >= 0 && v < 20) return this.$t('That sucks')
      else if (v >= 20 && v < 40) return this.$t('Nah')
      else if (v >= 40 && v < 60) return this.$t('So so')
      else if (v >= 60 && v < 80) return this.$t('High')
      else if (v >= 80 && v < 100) return this.$t('Soo high')
      else return this.$t('No way')
    }
  }
}
</script>
