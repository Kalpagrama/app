<template lang="pug">
div(
  :style=`{
    zIndex: 9999,
    borderRadius: '10px 10px 0 0', overflow: 'hidden',
    maxWidth: $q.screen.width  > 800 ? '500px' : $q.screen.width+'px',
    height: $q.screen.width > 800 ? '500px' : $q.screen.height-140+'px',
  }`
  ).column.full-width.items-start.content-start.b-40.q-py-sm.q-px-md
  //- node.name
  div(
    :style=`{
      textAlign: 'center'
    }`
    ).row.full-width.justify-center.q-py-sm
    span(:style=`{fontSize: '18px'}`).text-white.text-bold "{{ node.name }}"
  //- vote stat picker
  div(:style=`{order: 3}`).row.full-width.q-py-sm
    div(
      :style=`{
        height: '40px',
        borderRadius: '10px',
        overflow: 'hidden',
      }`
      ).row.full-width.items-center.content-center
      div(
        v-for="(s,si) in rateStat" :key="si"
        v-if="s.percent > 0"
        @click="voteSelected = si"
        :style=`{
          background: rateMeta[si].color,
          maxHeight: si === voteSelected ? '40px' : '20px',
          //- borderRadius: si === 0 ? '10px 0 0 10px' : si === 4 ? '0 10px 10px 0' : '0px',
          borderRadius: voteBorderRadius(si),
          overflow: 'hidden',
        }`
        ).col.full-height.cursor-pointer
        .row.fit.items-center.content-center.justify-center
          small(v-if="s.count > 0").text-white {{ s.count }}
  //- selected vote stat
  .col.full-width.scroll
    .row.fit.items-end.content-end.q-py-sm
      div(
        v-for="(v,vi) in voters" :key="v.oid+vi"
        :style=`{
          borderRadius: '10px', overflow: 'hidden',
        }`
        ).row.full-width.items-center.content-center.q-pa-sm.q-mb-sm.b-50
          q-btn(
            :to="'/user/'+v.oid"
            flat color="white" dense no-caps
            )
            user-avatar(:url="v.thumbUrl" :width="24" :height="24")
            span.text-grey-4.q-ml-sm {{ v.name }}
          .col
          small.text-grey-8.q-mt-xs.q-mx-xs {{ $date(v.createdAt, 'DD.MM.YYYY') }}
          //- small(:style=`{fontSize: '18px',}`).text-white.text-bold.q-mx-sm {{ v.rate * 10 }}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'nodeVoteBarStats',
  props: ['node', 'rateStat', 'rateMeta'],
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
        let rate
        let rateMap = {
          0: 0,
          1: 0.25,
          2: 0.5,
          3: 0.75,
          4: 1,
        }
        return v.rate === rateMap[this.voteSelected]
      })
    }
  },
  methods: {
    voteBorderRadius (index) {
      if (index === this.voteSelected) return '10px'
      else {
        if (index === 0) return '10px 0 0 10px'
        else if (index === 4) return '0 10px 10px 0'
        else return '0px'
      }
    }
  },
  async mounted () {
    this.$log('mounted')
    this.stats = await this.$rxdb.get(RxCollectionEnum.GQL_QUERY, 'objectStat', {params: {oid: this.node.oid}})
  }
}
</script>
