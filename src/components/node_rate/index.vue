<template lang="pug">
div(
  :style=`{position: 'relative', maxWidth: $q.screen.width+'px'}`).column.fit.bg-white
  //- header
  div(:style=`{position: 'absolute', right: '0px', top: '0px', zIndex: 1000, height: '60px', width: '60px'}`).row.items-center.justify-center
    q-btn(round flat icon="clear" @click="$emit('hide')")
  //- rate name
  div(:style=`{height: '80px'}`).row.full-width.justify-center.items-center
    h3.q-ma-xs {{ rateName }}
  //- drag shit
  div.row.full-width.justify-center
    div(:style=`{position: 'relative', width: '300px', height: '300px'}`).row
      q-icon(name="blur_on" :style=`{fontSize: '300px'}` color="grey-9")
      div(
        v-touch-pan.mouse.prevent="fingerDrag"
        :style=`{
          position: 'absolute', width: '60px', height: '60px',
          left: fingerLeft-30+'px', top: fingerTop-30+'px', zIndex: 1000,
          borderRadius: '30px', overflow: 'hidden'}`
        ).row.items-center.justify-center.bg-green
        q-icon(name="fingerprint" color="white" size="36px")
  //- debug
  div(v-if="false").row.full-width.justify-center
    //- small {{ fingerLeft }} / {{ fingerTop }}
    small {{ fingerRadius }}
  //- rating numbers
  div(:style=`{height: '80px'}`).row.full-width.justify-center.items-end
    h3.q-ma-xs.q-mr-sm {{ fingerRate }}
    //- h3.q-ma-xs.text-bold {{ nodeFull.rate * 100 }}
  //- actions
  transition(
    appear
    enter-active-class="animated slideInUp"
    leave-active-class="animated slideOutDown")
    q-btn(
      v-if="!loading"
      push color="green" no-caps :loading="nodeRating" @click="nodeRating ? '' : nodeRate()"
      :style=`{position: 'absolute', zIndex: 1000, left: '10px', bottom: '10px', width: 'calc(100% - 20px)', height: '60px', borderRadius: '10px'}`
      )
      span.text-bold.text-white Проголосовать
</template>

<script>
export default {
  name: 'nodeRate',
  components: {},
  data () {
    return {
      loading: true,
      node: null,
      nodeFull: null,
      // nodeRated: false,
      nodeRating: false,
      actions: [
        {id: 'answer', name: 'Ответить ядром'}
      ],
      fingerLeft: 150,
      fingerTop: 150
    }
  },
  computed: {
    nodeRated () {
      if (this.nodeFull) {
        // return this.nodeFull.rateUser
        return false
      } else {
        return false
      }
    },
    nodeYours () {
      if (this.nodeFull) {
        if (this.nodeFull.author.oid === this.$store.state.auth.user.oid) {
          return true
        } else {
          return false
        }
      } else {
        return false
      }
    },
    rateName () {
      let r = this.fingerRate
      if (r === 1) return 'Нет'
      else if (r > 1 && r <= 25) return 'Скорее нет'
      else if (r > 25 && r <= 50) return 'Может быть'
      else if (r > 50 && r <= 75) return 'Скорее да'
      else if (r > 75) return 'Да'
      else return 'Да'
    },
    fingerRate () {
      let r = this.fingerRadius
      if (r > 120) return 1
      else return Math.round(100 - ((r * 50) / 60))
    },
    fingerRadius () {
      let fl = this.fingerLeft
      let ft = this.fingerTop
      let flr = Math.abs(150 - fl)
      let ftr = Math.abs(150 - ft)
      return Math.sqrt(Math.pow(flr, 2) + Math.pow(ftr, 2))
    }
  },
  methods: {
    fingerDrag (e) {
      // this.$log('fingerDrag', e)
      let fl = this.fingerLeft + e.delta.x
      let ft = this.fingerTop + e.delta.y
      if (fl >= 0 && fl <= 300) this.fingerLeft = fl
      if (ft >= 0 && ft <= 300) this.fingerTop = ft
    },
    action ({id}) {
      this.$log('action', id)
      switch (id) {
        case 'answer': {
          this.$log('action', id)
          // this.nodeRated = true
          this.$emit('hide')
          break
        }
      }
    },
    async nodeRate () {
      try {
        this.$log('nodeRateJob start')
        this.nodeRating = true
        await this.$wait(600)
        let res = await this.$store.dispatch('node/nodeRate', {oid: this.node.oid, rate: this.fingerRate / 100})
        this.$log('nodeRateJob done', res)
        this.nodeRating = false
        await this.$wait(300)
        this.$emit('hide')
        // this.$refs.rateToAnswer.toggle()
      } catch (e) {
        this.$log('nodeRateJob error', e)
        this.nodeRating = false
      }
    }
  },
  async mounted () {
    this.$log('mounted')
    // get nodes...
    this.node = this.$store.state.node.node
    this.nodeFull = this.$store.state.node.nodeFull
    // deside is it mine node?
    // deside is it is not mine should i rate it or again?
    // where will be a rerate? or btn answer?
    await this.$wait(300)
    this.loading = false
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    this.$store.commit('node/stateSet', ['node', null])
    this.$store.commit('node/stateSet', ['nodeFull', null])
  }
}
</script>
