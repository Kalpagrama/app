<template lang="pug">
transition(appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
  div(
    v-kalpa-click-outside="voteOutsideClick"
    :style=`{
      position: 'absolute', zIndex: 20000, top: '0px',
      borderRadius: $store.state.ui.borderRadius+'px', overflow: 'hidden',
      background: 'rgba(0,0,0,0.5)'
    }`
    ).row.fit
    .col
      div(:style=`{position: 'relative'}`).column.fit
        div(
          v-for="(v,vi) in votes" :key="v.id"
          @mouseenter="voteOver = v.id"
          @mouseleave="voteOver = null"
          ).col.full-width.cursor-pointer
          .row.fit
            .col.full-height
              .row.fit.items-center.justify-end.q-px-sm
                transition(appear enter-active-class="animated tada" leave-active-class="animated fadeOut")
                  q-icon(
                    v-if="voteOver === v.id"
                    name="emoji_people"
                    :size="voteId === v.id ? '50px' : '40px'"
                    :color="voteId === v.id ? 'green' : 'white'")
                span(
                  @click="voteEnd(v.id)"
                  :class=`{
                    'text-bold': voteOver === v.id,
                    'text-white': voteId !== v.id,
                    'text-green': voteId === v.id,
                  }`
                  :style=`{
                    userSelect: 'none',
                    fontSize: voteOver === v.id ? '40px' : '20px'
                  }`
                  ).cursor-pointer {{ v.name }}
            div(:style=`{width: '76px'}`).row.full-height.items-center.content-center.justify-center
              span(
                :class=`{
                  'text-white': v.id !== voteId,
                  'text-green': v.id === voteId
                }`
                :style=`{
                  userSelect: 'none',
                  fontSize: voteOver === v.id ? 50+(votes.length-vi*5)+'px' : 30+(votes.length-vi*5)+'px'
                }`
                ).text-bold {{ v.value }}
</template>

<script>
import { NodeApi } from 'src/api/node'

export default {
  name: 'layoutPip-vote',
  props: ['node', 'visible', 'active', 'mini', 'stateNode'],
  data () {
    return {
      voteId: null,
      voteOver: null,
      voteShow: false,
      votes: [
        {id: 1, name: this.$t('nodeVote100', 'Прямо в точку!'), value: 100},
        {id: 0.7, name: this.$t('nodeVote70', 'Близко'), value: 70},
        {id: 0.5, name: this.$t('nodeVote50', 'Где-то рядом'), value: 50},
        {id: 0.3, name: this.$t('nodeVote30', 'Ну такое...'), value: 30},
        {id: 0, name: this.$t('nodeVote0', 'Очень далеко'), value: 0},
      ]
    }
  },
  watch: {
    'stateNode.voteShow': {
      // deep: true,
      immediate: true,
      async handler (to, from) {
        if (to) {
          // alert('stateNode.voteShow TRUE' + to)
          await this.$wait(500)
          this.voteShow = true
        }
        else {
          this.voteShow = false
        }
      }
    },
    active: {
      handler (to, from) {
        if (to === false) {
          this.stateNode.set('voteShow', false)
        }
      }
    }
  },
  methods: {
    voteOutsideClick (e) {
      this.$log('voteOutsideClick', e)
      if (this.voteShow) {
        this.stateNode.set('voteShow', false)
      }
    },
    async voteEnd (val) {
      this.$log('voteEnd')
      this.voteId = val
      await this.$wait(200)
      let res = await NodeApi.nodeVote(this.node.oid, val)
      this.$log('voteEnd', res)
      await this.$wait(200)
      this.stateNode.set('voteShow', false)
      this.voteId = null
    }
  }
}
</script>
