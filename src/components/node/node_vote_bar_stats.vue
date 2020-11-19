<template lang="pug">
div(
  :style=`{
    zIndex: 9999,
    borderRadius: '10px 10px 0 0', overflow: 'hidden',
    maxWidth: $q.screen.width  > 800 ? '500px' : $q.screen.width+'px',
    height: $q.screen.width > 800 ? '500px' : $q.screen.height-140+'px',
  }`
  ).column.full-width.items-start.content-start.b-30
  //- node.name
  div(
    :style=`{
      position: 'relative',
      textAlign: 'center'
    }`
    ).row.full-width.justify-center.q-py-md
    span(:style=`{fontSize: '18px'}`).text-white.text-bold Спектр голосов
    q-btn(
      @click="$emit('close')"
      round flat color="white" icon="clear"
      :style=`{position: 'absolute', zIndex: 100, right: '8px', top: '8px'}`)
  //- vote stat picker
  div(:style=`{order: 0}`).row.full-width.q-py-sm.q-px-md
    div(
      :style=`{
        height: '40px',
      }`
      ).row.full-width.items-center.content-center
      div(
        v-for="(s,si) in rateStat" :key="si"
        @click="voteSelected = si"
        :style=`{
          position: 'relative',
          background: s.color,
          maxHeight: si === voteSelected ? '40px' : '20px',
          maxWidth: s.percent+'%',
          borderRadius: voteBorderRadius(si),
          overflow: 'hidden',
        }`
        ).col.full-height.cursor-pointer
        .row.fit.items-center.content-center.justify-center
          small(
            :class=`{
              'text-white': si === voteSelected,
              'text-grey-4': si !== voteSelected,
              'text-bold': si === voteSelected,
            }`
            ) {{ s.count }}
  //- vote stat name
  .row.full-width.justify-center
    span.text-white {{ rateStat[voteSelected].name }}
  //- selected vote stat
  .col.full-width.scroll
    .row.fit.items-start.content-start.q-py-sm.q-px-md
      router-link(
        v-for="(v,vi) in voters" :key="v.oid+vi"
        :to="'/user/'+v.oid"
        :style=`{
          borderRadius: '10px', overflow: 'hidden',
        }`
        ).row.full-width.items-center.content-center.q-pa-sm.q-mb-sm.b-40
          q-btn(
            flat color="white" dense no-caps
            )
            user-avatar(:url="v.thumbUrl" :width="28" :height="28")
            span.text-grey-4.q-ml-sm {{ v.name }}
          .col
          small.text-grey-8.q-mx-xs {{ $date(v.createdAt, 'DD.MM.YYYY') }}
  //- rate again
  div(
    v-if="node.rateUser"
    ).row.full-width.q-pa-md
    q-btn(
      @click="$emit('rateAgain')"
      flat color="grey-4" no-caps icon="refresh"
      :style=`{
        height: '50px',
        background: 'rgb(35,35,35)',
      }`).full-width
      span.q-ml-sm Переголосовать
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'nodeVoteBarStats',
  props: ['node', 'rateStat'],
  data () {
    return {
      stats: null,
      voteSelected: 0,
    }
  },
  computed: {
    voters () {
      if (!this.stats) return []
      return this.stats.votes.filter(v => {
        let rate = this.rateStat[this.voteSelected].value
        return v.rate === rate
      })
    }
  },
  methods: {
    voteBorderRadius (index) {
      if (index === this.voteSelected) return '10px'
      else {
        if (index === 0) return '10px 0 0 10px'
        else if (index === this.rateStat.length - 1) return '0 10px 10px 0'
        else return '0px'
      }
    }
  },
  async mounted () {
    this.$log('mounted')
    let countMax = this.rateStat.reduce((acc, val, ii, arr) => {
      if (val.percent > acc) acc = val.percent
      return acc
    }, 0)
    this.voteSelected = this.rateStat.findIndex(r => r.percent === countMax)
    this.$set(this, 'stats', await this.$rxdb.get(RxCollectionEnum.GQL_QUERY, 'objectStat', {params: {oid: this.node.oid}}))
  }
}
</script>
