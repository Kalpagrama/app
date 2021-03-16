<template lang="pug">
div(
  :style=`{
    position: 'relative',
    borderRadius: '20px 20px 0 0',
    paddingBottom: 'calc(env(safe-area-inset-bottom) + 8px)',
  }`
  ).row.full-width.justify-center.b-40
    div(
      :style=`{
        maxWidth: 500+'px',
      }`
      ).row.full-width.items-start.content-start.q-pb-xl
      //- header
      .row.full-width.q-pa-md
        span(:style=`{fontSize: '24px'}`).text-white.text-bold {{$tt('Vote stats')}}
        .col
        q-btn(round flat color="white" icon="clear" @click="$emit('close')")
      //- body
      div(
        :style=`{
          maxHeight: '500px',
        }`
        ).row.full-width.items-start.content-start.q-px-sm.scroll
        router-link(
          v-for="(v,vi) in voters" :key="v.oid+vi"
          :to="'/user/'+v.oid"
          :style=`{
            borderRadius: '10px', overflow: 'hidden',
            background: 'rgb(45,45,45)',
          }`
          ).row.full-width.items-center.content-center.q-pa-sm.q-mb-sm
            q-btn(
              flat color="white" dense no-caps)
              user-avatar(:url="v.thumbUrl" :width="28" :height="28")
              span.text-grey-4.q-ml-sm {{ v.name }}
            .col
            small.text-grey-8.q-mr-sm {{ $date(v.date, 'DD.MM.YYYY') }}
            div(
              :style=`{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                background: $rateMeta.find(r => v.rate >= r.valueMin && v.rate < r.valueMax).color,
              }`
              ).q-mr-sm
      //- footer
      div(
        v-if="node.author.oid !== $store.getters.currentUser().oid"
        :style=`{
          //- position: 'absolute', zIndex: 1000, bottom: '0px',
        }`
        ).row.full-width.justify-center.q-pa-sm
        div(
          :style=`{
            maxWidth: 500+'px',
          }`
          ).row.full-width.items-center.content-center
          q-btn(
            @click="$emit('voteAgain')"
            outline color="green" no-caps icon="refresh"
            :style=`{
              height: '50px',
              background: 'rgb(45,45,45)',
            }`).full-width
            span.q-ml-sm {{$tt('Revote')}}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'voteStats',
  props: ['node'],
  data () {
    return {
      rateId: null,
      rateIdMax: null,
      stats: null,
    }
  },
  computed: {
    voters () {
      if (!this.stats) return []
      // return votes filtered by selected rateId
      if (this.rateId) {
        return this.stats.votes.filter(v => {
          let rate = this.$rateMeta.find(r => r.value === this.rateId)
          return v.rate >= rate.valueMin && v.rate < rate.valueMax
        })
      }
      // return all the voters
      else {
        return this.stats.votes
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
      this.rateIdMax = rateMax.value
    }
  }
}
</script>
