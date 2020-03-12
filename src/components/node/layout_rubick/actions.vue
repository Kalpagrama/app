<template lang="pug">
.row.full-width.justify-center.items-start.content-start.q-px-xs.q-my-md
  div(:style=`{maxWidth: maxWidth+'px'}`).row.full-width.items-start.content-start
    div(
      v-if="nodeFull"
      :style=`{
        position: 'relative', height: '70px', borderRadius: '10px', overflow: 'hidden'}`).row.full-width.items-center.bg-grey-7
      //- pan btn
      div(
        v-if="canVote"
        v-touch-pan.left.right.prevent.mouse="votePan"
        :style=`{
          position: 'absolute', left: voteLeft+'px', zIndex: 200,
          height: '60px', width: '90px'}`
          ).row.items-center.justify-center
        q-btn(
          round push color="white" :loading="voteVoting"
          :style=`{height: '40px', width: '40px', borderRadius: '50%', cursor: votePanning ? 'grab' : 'pointer'}`
          ).row.items-center.justify-center.bg-green
          q-icon(name="blur_on" color="white" size="30px")
      //- vote tint and helper text
      div(
        v-if="votePanning"
        :style=`{position: 'absolute', zIndex: 198}`).row.fit.items-center.justify-center.bg-white
        span Pan to vote
      div(
        :style=`{marginLeft: canVote ? '70px' : '10px'}`).row.full-height.items-center.content-center.q-px-sm
        span(:style=`{fontSize: '18px'}`).text-white.text-bold.text-center {{ voteHuman(nodeFull.rate) }}
        span.text-white.text-center.q-mt-xs /{{ voteHuman(nodeFull.rateUser) }}
      //- user name
      div(
        @click="$router.push('/user/' + nodeFull.author.oid)").col.full-height
        .row.fit.items-center.justify-end.cursor-pointer
          span(:style=`{userSelect: 'none'}`).text-white {{ nodeFull.author.name | cut(40) }}
      //- user avatar
      div(
        @click="$router.push('/user/' + nodeFull.author.oid)"
        :style=`{height: '60px', width: '75px'}`).row.items-center.justify-center.cursor-pointer
        kalpa-avatar(:url="nodeFull.author.thumbUrl")
</template>

<script>
export default {
  name: 'nodeLayoutOpenedActions',
  props: ['node', 'nodeFull', 'width', 'maxWidth'],
  data () {
    return {
      voteLeft: 0,
      voteValue: 0,
      voteVoting: false,
      votePanning: false
    }
  },
  computed: {
    userOid () {
      return this.$store.state.auth.userOid
    },
    canVote () {
      return this.userOid !== this.node.author.oid
    }
  },
  watch: {
    votePanning: {
      handler (to, from) {
        this.$emit('votePanning', to)
      }
    },
    voteValue: {
      handler (to, from) {
        this.$emit('voteValue', to)
      }
    }
  },
  methods: {
    voteHuman (vote) {
      let v = ((vote * 100) / 10).toFixed(1)
      let arr = v.split('.')
      return arr[0] + ',' + arr[1]
    },
    async votePan (e) {
      // this.$log('votePan', e.delta.x)
      let to = this.voteLeft + e.delta.x
      if (to > 0 && to <= this.width - 90) {
        this.voteLeft += e.delta.x
        let v = Math.round((this.voteLeft / (this.width - 90)) * 100)
        if (v === 0) this.voteValue = 1
        else if (v === 100) this.voteValue = 99
        else this.voteValue = v
      }
      if (e.isFirst) {
        this.$log('votePan FIRST')
        this.votePanning = true
      }
      if (e.isFinal) {
        this.$log('votePan FINAL', this.voteValue / 100)
        await this.nodeVote(this.voteValue / 100)
        this.$tween.to(this, 0.4, {voteLeft: 0})
        this.votePanning = false
      }
    },
    async nodeVote (rate) {
      try {
        this.$log('nodeVote start', rate)
        if (!rate) throw new Error('No rate!')
        if (!this.canVote) throw new Error('Cant vote for your node!')
        this.voteVoting = true
        await this.$wait(800)
        this.$store.dispatch('node/nodeRate', {node: this.node, rateUser: rate})
          .catch(err => this.$logE('nodeVote err', err))
        this.$log('nodeVote done')
        this.voteVoting = false
      } catch (e) {
        this.$log('nodeVote error', e)
        this.voteVoting = false
      }
    }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
