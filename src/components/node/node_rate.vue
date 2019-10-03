<template lang="pug">
.row.fit
  div(
    v-if="!nodeRated && nodeFull"
    :style=`{position: 'relative', maxWidth: $q.screen.width+'px'}`).column.fit.bg-white
    //- header
    div(:style=`{height: '80px'}`).row.full-width.justify-center.items-center
      h3.q-ma-xs Далеко
    .row.full-width.justify-center
      q-icon(name="blur_on" :style=`{fontSize: '300px'}`)
        q-btn(round color="primary" :style=`{position: 'absolute', right: '0px', bottom: '15px'}` size="xl" icon="fingerprint")
    //- rating
    div(:style=`{height: '80px'}`).row.full-width.justify-center.items-end
      h4.q-ma-xs.q-mr-sm {{ nodeFull.rateUser * 100 }} /
      h3.q-ma-xs.text-bold {{ nodeFull.rate * 100 }}
    //- .row.full-width
    //-   small {{ node }}
    //- .row.full-width
    //-   small {{ nodeFull.rate }} / {{ nodeFull.rateUser }}
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
      nodeRated: false,
      nodeRating: false,
      actions: [
        {id: 'answer', name: 'Ответить ядром'}
      ]
    }
  },
  computed: {
    // nodeRated () {
    //   return this.nodeFull.rateUser
    // }
  },
  methods: {
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
        let res = await this.$store.dispatch('node/nodeRate', {oid: this.node.oid, rate: 0.2389492834})
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
