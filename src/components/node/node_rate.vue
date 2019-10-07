<template lang="pug">
div(v-if="node").row.fit
  div(
    v-if="!nodeRated && nodeFull"
    :style=`{position: 'relative', maxWidth: $q.screen.width+'px'}`).column.fit.bg-white
    //- header
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
          ).row.items-center.justify-center.bg-primary
          q-icon(name="fingerprint" color="white" size="36px")
    //- debug
    div(v-if="false").row.full-width.justify-center
      //- small {{ fingerLeft }} / {{ fingerTop }}
      small {{ fingerRadius }}
    //- rating numbers
    div(:style=`{height: '80px'}`).row.full-width.justify-center.items-end
      h3.q-ma-xs.q-mr-sm {{ fingerRate }}
      //- h3.q-ma-xs.text-bold {{ nodeFull.rate * 100 }}
    //- footer
    div(:style=`{position: 'absolute', zIndex: 1000, bottom: '0px', height: '76px', background: 'rgba(255, 255, 255, 0.8)'}`
      ).row.full-width.items-center.q-px-sm
      k-menu-popup(ref="rateToAnswer" :noName="true" :actions="actions" @action="action" @hide="$emit('hide')")
      q-btn(
        color="primary" no-caps :loading="nodeRating" @click="nodeRate()"
        :style=`{height: '60px', borderRadius: '10px'}`
        ).full-width
        span.text-bold.text-white Проголосовать
  node-answer(
    v-else
    :node="node" :nodeFull="nodeFull" @hide="$emit('hide')")
</template>

<script>
import nodeAnswer from './node_answer'

export default {
  name: 'nodeRate',
  components: {nodeAnswer},
  data () {
    return {
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
        return this.nodeFull.rateUser
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
      // return 0
    }
  },
  methods: {
    fingerDrag (e) {
      // this.$log('fingerDrag', e)
      // if (this.fingerRadius >= 116) return
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
          this.nodeRated = true
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
        this.$refs.rateToAnswer.toggle()
      } catch (e) {
        this.$log('nodeRateJob error', e)
        this.nodeRating = false
      }
    }
  },
  async mounted () {
    this.$log('mounted')
    this.node = this.$store.state.node.node
    this.nodeFull = this.$store.state.node.nodeFull
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
