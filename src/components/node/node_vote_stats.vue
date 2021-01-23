<template lang="pug">
div(
  :style=`{
    position: 'relative',
    borderRadius: '10px',
  }`
  ).row.full-width.items-start.content-start.b-30
  //- header
  div(
    :style=`{position: 'relative',}`
    ).row.full-width.justify-center.q-pt-md.q-pb-sm
    span(:style=`{fontSize: '18px',}`).text-white.text-bold Статистика голосов
    q-btn(
      @click="$emit('close')"
      round flat color="white" icon="clear"
      :style=`{
        position: 'absolute', zIndex: 100, right: '10px', top: '10px',
      }`)
  //- header rates selector
  .row.full-width.items-start.content-start.justify-center.q-pa-sm
    div(
      :style=`{
        maxWidth: 500+'px',
      }`
      ).row.full-width
      div(
        :style=`{
          minHeight: '20px',
        }`
        ).row.full-width
        div(
          :style=`{
            borderRadius: '10px',
            overflow: 'hidden',
          }`
          ).row.fit.items-center.content-center
          div(
            v-for="(r,ri) in $rateMeta" :key="r.value"
            @click="rateId = r.value"
            :style=`{
              background: r.colorBackground,
              //- borderRadius: ri === 0 ? '10px 10px 0 0' : '10px',
              borderRadius: r.value === rateId ? '10px' : rateRadius(ri),
              //- minWidth: ri === 2 ? '80px !important' : 'null',
              minHeight: r.value === rateId ? '40px' : '20px',
              maxHeight: r.value === rateId ? '40px' : '20px',
            }`
            ).col.full-height
            div(
              ).row.fit.items-center.content-center.justify-center.cursor-pointer
              small(
                :style=`{
                  fontSize: '8.5px', pointerEvents: 'none', userSelect: 'none',
                  whiteSpace: 'nowrap'
                }`).text-white {{ r.name }}
  //- body
  q-tab-panels(
    v-model="rateId"
    swipeable animated
    :style=`{}`).full-width.b-30
    q-tab-panel(
      v-for="(p,pi) in $rateMeta" :key="p.value" :name="p.value"
      :style=`{
        background: 'none',
        minHeight: 500-100+'px',
      }`
      ).row.full-width.items-start.content-start.justify-center.q-pa-sm
      div(
        :style=`{
          maxWidth: 500+'px',
        }`
        ).row.full-width.items-start.content-start
        router-link(
          v-for="(v,vi) in voters" :key="v.oid+vi"
          :to="'/user/'+v.oid"
          :style=`{
            borderRadius: '10px', overflow: 'hidden',
            background: 'rgb(35,35,35)',
          }`
          ).row.full-width.items-center.content-center.q-pa-sm.q-mb-sm
            q-btn(
              flat color="white" dense no-caps
              )
              user-avatar(:url="v.thumbUrl" :width="28" :height="28")
              span.text-grey-4.q-ml-sm {{ v.name }}
            .col
            small.text-grey-8.q-mx-xs {{ $date(v.date, 'DD.MM.YYYY') }}
  //- footer
  div(
    v-if="node.author.oid !== $store.getters.currentUser().oid"
    :style=`{
      position: 'absolute', zIndex: 1000, bottom: '0px',
    }`
    ).row.full-width.justify-center.q-pa-sm
    div(
      :style=`{
        maxWidth: 500+'px',
      }`
      ).row.full-width.items-center.content-center
      q-btn(
        @click="$emit('voteAgain')"
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
  name: 'nodeVoteStats',
  props: ['node'],
  data () {
    return {
      rateId: 0,
      stats: null,
    }
  },
  computed: {
    voters () {
      if (!this.stats) return []
      return this.stats.votes.filter(v => {
        let rate = this.$rateMeta.find(r => r.value === this.rateId)
        return v.rate >= rate.valueMin && v.rate < rate.valueMax
      })
    }
  },
  watch: {
    // node: {
    //   deep: true,
    //   immediate: true,
    //   async handler (to, from) {
    //     if (to) {
    //       let countMax = this.rateStat.reduce((acc, val, ii, arr) => {
    //         if (val.percent > acc) acc = val.percent
    //         return acc
    //       }, 0)
    //       this.voteSelected = this.rateStat.findIndex(r => r.percent === countMax)
    //       this.$set(this, 'stats', await this.$rxdb.get(RxCollectionEnum.GQL_QUERY, 'objectStat', {params: {oid: this.node.oid}}))
    //     }
    //   }
    // }
  },
  methods: {
    rateRadius (ri) {
      if (ri === 0) {
        return '10px 0 0 10px'
      }
      else if (ri === this.$rateMeta.length - 1) {
        return '0 10px 10px 0'
      }
      else {
        return ''
      }
    }
  },
  async created () {
    this.$log('created')
    // get node stats
    this.$set(this, 'stats', await this.$rxdb.get(RxCollectionEnum.GQL_QUERY, 'objectStat', {params: {oid: this.node.oid}}))
    // set rateMax
    let percentMax = null
    let percentMaxIndex = 0
    this.node.rateStat.map((r, ri) => {
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
    // let rateMax = this.$rateMeta.find(r => {
    //   return this.node.rate >= r.valueMin && this.node.rate < r.valueMax
    // })
    if (rateMax) {
      this.rateId = rateMax.value
    }
  }
}
</script>
