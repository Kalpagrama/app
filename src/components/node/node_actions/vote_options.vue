<template lang="pug">
div(
  ref="vote-options-wrapper"
  ).row.fit.tems-center.content-center.scroll.b-30
  div(
    ).row.fit.items-center.content-center.no-wrap
    div(
      :style=`{
        width: '100px', minWidth: '100px',
      }`
      ).row
    div(
      v-for="(r,ri) in $rateMeta" :key="ri"
      :style=`{
        position: 'relative',
        height: '34px',
        //- width: '70px',
        //- width: 'auto',
        minWidth: '70px',
        maxWidth: '70px',
        background: r.colorBackground,
        borderRadius: getRadius(ri),
        textAlign: 'center',
      }`
      @click="vote(r.value)"
      ).row.items-center.content-center.justify-center.q-px-sm.cursor-pointer
      small(
        :style=`{
          //- whiteSpace: 'nowrap',
          pointerEvents: 'none',
          lineHeight: 1,
        }`).text-white {{ r.name }}
      div(
        v-if="voteVoting === r.value"
        :style=`{
          position: 'absolute', zIndex: 300, left: '0px',
          background: r.color,
          borderRadius: getRadius(ri),
        }`
        ).row.fit.items-center.content-center.justify-center
        q-spinner(size="16px" color="white")
</template>

<script>
import { ObjectApi } from 'src/api/object'

export default {
  name: 'voteOptions',
  props: ['node'],
  data () {
    return {
      voteVoting: null,
    }
  },
  methods: {
    getRadius (idx) {
      if (idx === 0) return '20px 0 0 20px'
      else if (idx === this.$rateMeta.length - 1) return '0 20px 20px 0'
      else return 'none'
    },
    async vote (val) {
      try {
        this.$log('vote', val)
        this.voteVoting = val
        // await this.$wait(1500)
        let res = await ObjectApi.vote(this.node.oid, val)
        this.$log('vote done', res)
        this.voteVoting = null
        this.$emit('voted')
      }
      catch (e) {
        this.$log('vote error', e)
        this.voteVoting = false
        this.$emit('voted')
      }
    }
  },
  mounted () {
    this.$log('mounted')
    this.$nextTick(() => {
      this.$refs['vote-options-wrapper'].scrollLeft = 1000
    })
  }
}
</script>
