<style>
.diag {
  background: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' version='1.1' preserveAspectRatio='none' viewBox='0 0 100 100'><line x1='0' y1='0' x2='100' y2='100' stroke='black' vector-effect='non-scaling-stroke'/><line x1='0' y1='100' x2='100' y2='0' stroke='black' vector-effect='non-scaling-stroke'/></svg>");
  background-repeat: no-repeat;
  background-position: center center;
  background-size: 100% 100%, auto;
}
</style>

<template lang="pug">
div(
  :style=`{position: 'relative'}`
  ).row.items-center.content-center
  q-dialog(
    v-model="showVotes" position="bottom")
    div(
      :style=`{
        zIndex: 9999,
        borderRadius: '10px 10px 0 0', overflow: 'hidden',
        maxWidth: $q.screen.width  > 800 ? '400px' : $q.screen.width+'px',
      }`
      ).row.full-width.b-40
      q-btn(
        @click="vote(a.value)"
        v-for="(a,ai) in actions" :key="ai"
        flat no-caps icon="adjust" align="left" size="lg"
        :loading="voting === a.value"
        :style=`{
          color: a.color,
        }`
        ).full-width
        span.text-white.text-bold.q-ml-sm {{ a.label }}
  q-btn(
    @click="voteStart()"
    round flat
    :loading="showVotes").shaking
    q-icon(name="adjust" size="30px" color="purple")
  //- v-touch-pan.prevent.mouse="onPan"
  //- transition(
    appear
    enter-active-class="animated zoomIn"
    leave-active-class="animated zoomOut")
    div(
      v-if="showVotearea"
      @mousemove="onMousemove"
      @click="vote(hypotenuse)"
      accessKey="votearea"
      :style=`{
        position: 'absolute', zIndex: 1000,
        width: width+'px', height: width+'px',
        borderRadius: '50%',
        background: 'rgba(50,50,50,0.9)',
        right: -width/2+20+'px',
      }`
      ).row.shadow-10
      div(
        :style=`{
          position: 'relative',
          pointerEvents: 'none',
        }`
        ).row.fit
        div(
          icon="adjust" color="purple" round
          :style=`{
            position: 'absolute', zIndex: 1100,
            top: y-((60*hypotenuse)/2)+'px',
            left: x-((60*hypotenuse)/2)+'px',
            borderRadius: '50%',
            //- pointerEvents: 'none',
            width: 60*hypotenuse+'px', height: 60*hypotenuse+'px',
          }`).row.items-center.content-center.justify-center
          q-icon(
            v-if="!voting"
            name="adjust" color="purple"
            :size="100*hypotenuse > 30 ? 100*hypotenuse+'px' : 30+'px'")
          q-spinner(
            v-if="voting"
            color="purple"
            :size="100*hypotenuse > 30 ? 100*hypotenuse+'px' : 30+'px'")
          span(
            :style=`{
              position: 'absolute', zIndex: 1300,
              top: '-40px',
              left: ((40*hypotenuse)/2)+'px',
              fontSize: '20px',
              whiteSpace: 'nowrap'
            }`
            ).text-white.text-bold {{ Math.round(hypotenuse * 100) }} {{ hypotenuseLabel }}
          //- div(
            v-touch-pan.prevent.mouse="onPan"
            accessKey="votepan"
            :style=`{
              position: 'absolute', zIndex: 1300,
              bottom: '-66px',
              width: '60px', height: '60px'
            }`
            ).row.bg-red
</template>

<script>
import { NodeApi } from 'src/api/node'

export default {
  name: 'nodeVote',
  props: ['node'],
  data () {
    return {
      voting: false,
      votingAgain: false,
      voteMenuOpened: false,
      showVotes: false,
      showVotearea: false,
      width: 500,
      x: 0,
      y: 0
    }
  },
  computed: {
    actions () {
      return [
        {id: 1, label: this.$t('nodeVote100', 'Прямо в точку!'), value: 100, color: '#850e3f'},
        {id: 0.7, label: this.$t('nodeVote70', 'Близко'), value: 70, color: '#8f4067'},
        {id: 0.5, label: this.$t('nodeVote50', 'Где-то рядом'), value: 50, color: '#99718f'},
        {id: 0.3, label: this.$t('nodeVote30', 'Ну такое...'), value: 30, color: '#a4a9bc'},
        {id: 0.1, label: this.$t('nodeVote0', 'Очень далеко'), value: 0, color: '#aedce6'},
      ]
    },
    hypotenuse () {
      let x = Math.abs((this.width / 2) - this.x)
      let y = Math.abs((this.width / 2) - this.y)
      let z = Math.sqrt((x * x) + (y * y))
      return 1 - (z / (this.width / 2))
    },
    hypotenuseLabel () {
      const inRange = (a, b) => {
        if (this.hypotenuse >= a && this.hypotenuse < b) return true
        else return false
      }
      if (inRange(0, 0.1)) return 'Too bad'
      else if (inRange(0.1, 0.3)) return 'So so'
      else if (inRange(0.3, 0.5)) return 'Near near'
      else if (inRange(0.5, 0.7)) return 'Soo closee'
      else if (inRange(0.7, 1)) return 'Thats it!'
      else return 'Nothing'
    }
  },
  methods: {
    onPan (e) {
      this.$log('onPan')
      if (e.evt.accessKey !== 'votepan') return
      let rect = e.evt.target.getBoundingClientRect()
      this.onMousemove({
        target: {accessKey: 'votearea'},
        layerX: e.position.left - rect.left,
        layerY: e.position.top - rect.top
      })
    },
    onMousemove (e) {
      this.$log('onMousemove', e.target.accessKey)
      if (e.target.accessKey !== 'votearea') return
      this.x = e.layerX
      this.y = e.layerY
    },
    voteStart () {
      this.$log('voteStart')
      // if its me
      let currentUser = this.$store.getters.currentUser()
      if (currentUser.profile.role === 'GUEST') {
        this.$router.push('/auth/sign-in')
      }
      else {
        if (currentUser.oid === this.node.author.oid) {
          this.$q.notify({type: 'negative', position: 'top', message: 'Cant vote for your node!'})
        }
        else {
          this.showVotes = true
          // this.showVotearea = true
        }
      }
    },
    async vote (val) {
      try {
        this.$log('vote start', this.node.oid, val)
        this.voting = val
        await this.$wait(500)
        let res = await NodeApi.nodeVote(this.node.oid, val)
        this.$log('vote done', res)
        this.voting = false
        this.votingAgain = false
        this.showVotes = false
        this.showVotearea = false
      }
      catch (e) {
        this.$log('vote error', e)
        this.$q.notify({type: 'negative', position: 'top', message: e.toString()})
        this.voting = false
        this.votingAgain = false
        this.showVotes = false
        this.showVotearea = false
      }
    }
  }
}
</script>
