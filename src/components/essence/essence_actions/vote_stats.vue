<template lang="pug">
div(
  :style=`{
    position: 'relative',
    borderRadius: '20px 20px 0 0',
    paddingBottom: 'calc(env(safe-area-inset-bottom) + 8px)',
  }`
  ).column.full-width.justify-center.b-40
      //div(
      //  :style=`{
      //    maxWidth: 500+'px',
      //  }`
      //  ).row.full-width.items-start.content-start.q-pb-xl
      //- header
      .row.full-width.q-pa-md
        .col
          span(:style=`{fontSize: '24px'}`).text-white.text-bold {{$t('Votes')}}
        q-btn(round flat color="white" icon="clear" @click="$emit('close')")
      //- header rates selector
      .row.full-width.items-start.content-start.justify-center.q-px-sm
        div(
          :style=`{
            maxWidth: 500+'px',
            minHeight: '54px',
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
                //- overflow: 'hidden',
              }`
              ).row.fit.items-center.content-center
              div(
                v-for="(r,ri) in $rateMeta" :key="r.value"
                @click="rateId === r.value ? rateId = null : rateId = r.value"
                :style=`{
                  position: 'relative',
                  background: r.colorBackground,
                  borderRadius: r.value === rateId ? '10px' : rateRadius(ri),
                  minHeight: r.value === rateId ? '40px' : '20px',
                  maxHeight: r.value === rateId ? '40px' : '20px',
                }`
                ).col.full-height
                //- voters stats
                div(:style=`{position: 'absolute', zIndex: 100, top: '-20px',}`).row.full-width.justify-center
                  small.text-white {{ getVotersCount(r.value) || '' }}
                //- vote rect
                div(
                  ).row.fit.items-center.content-center.justify-center.cursor-pointer
                  small(
                    :style=`{
                      fontSize: '8.5px', pointerEvents: 'none', userSelect: 'none',
                      whiteSpace: 'nowrap'
                    }`).text-white {{ r.name }}
      //- body
      div(
        :style=`{
          //- minHeight: '440px',
          //- maxHeight: '440px',
        }`
        ).col.full-width.scroll
        .row.full-width.items-start.content-start.q-px-sm
          router-link(
            v-for="(v,vi) in voters" :key="v.oid+vi"
            :to="'/user/'+v.oid"
            :style=`{
              borderRadius: '10px', overflow: 'hidden',
              background: 'rgb(45,45,45)',
              //- minHeight: '400px'
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
        v-if="essence.author.oid !== $store.getters.currentUser.oid"
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
            span.q-ml-sm {{$t('Revote')}}
          q-btn(
            v-close-popup
            @click="$emit('renode')"
            outline color="green" no-caps icon="add"
            :style=`{
              height: '50px',
              background: 'rgb(45,45,45)',
            }`).full-width
            span.q-ml-sm {{$t('Other meaning...')}}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'voteStats',
  props: ['essence'],
  data () {
    return {
      rateId: null,
      rateIdMax: null,
      stats: null,
    }
  },
  computed: {
    rateInfo () {
      return this.$rateMeta.find(r => r.value === this.rateId)
    },
    voters () {
      if (!this.stats) return []
      // return votes filtered by selected rateId
      if (this.rateInfo) {
        return this.stats.votes.filter(v => {
          return v.rate >= this.rateInfo.valueMin && v.rate < this.rateInfo.valueMax
        })
        // return this.stats.votes
      }
      // return all the voters
      else {
        return this.stats.votes
      }
    }
  },
  methods: {
    getVotersCount (value) {
      if (!this.stats) return 0
      let rateInfo = this.$rateMeta.find(r => r.value === value)
      return this.stats.votes.filter(v => {
        return v.rate >= rateInfo.valueMin && v.rate < rateInfo.valueMax
      }).length
    },
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
    // get essence stats
    this.$set(this, 'stats', await this.$rxdb.get(RxCollectionEnum.GQL_QUERY, 'objectStat', {params: {oid: this.essence.oid}}))
    // set rateMax
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
    // let rateMax = this.$rateMeta.find(r => {
    //   return this.essence.rate >= r.valueMin && this.essence.rate < r.valueMax
    // })
    if (rateMax) {
      this.rateIdMax = rateMax.value
    }
  }
}
</script>
