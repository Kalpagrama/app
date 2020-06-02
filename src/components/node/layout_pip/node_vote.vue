<template lang="pug">
div(
  :style=`{
    position: 'absolute', zIndex: 20000, top: '0px',
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
              span(
                @click="voteEnd(v.id)"
                :class=`{
                  'text-bold': voteOver === v.id
                }`
                :style=`{
                  userSelect: 'none',
                  fontSize: voteOver === v.id ? '50px' : '20px'
                }`
                ).text-white.cursor-pointer {{ v.name }}
          div(:style=`{width: '76px'}`).row.full-height.items-center.content-center.justify-center
            span(
              :style=`{
                userSelect: 'none',
                fontSize: voteOver === v.id ? '50px' : '20px'
              }`
              ).text-white.text-bold {{ v.id }}
  div(
    :style=`{width: '0px'}`
    ).row.full-height.bg-red
</template>

<script>
import { NodeApi } from 'src/api/node'

export default {
  name: 'layoutPip-vote',
  props: ['node'],
  data () {
    return {
      voteOver: null,
      votes: [
        {id: 0.9, name: 'Thats it!'},
        {id: 0.7, name: 'Скорее да'},
        {id: 0.5, name: 'Может быть'},
        {id: 0.3, name: 'Скорее нет'},
        {id: 0.1, name: 'Нет'}
      ]
    }
  },
  methods: {
    async voteEnd (val) {
      this.$log('voteEnd')
      let res = await NodeApi.nodeVote(this.node.oid, val)
      this.$log('voteEnd', res)
      this.$emit('end')
    }
  }
}
</script>
