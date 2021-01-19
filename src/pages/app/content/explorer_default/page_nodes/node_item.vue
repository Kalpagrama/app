<style lang="sass">
.node-item
  &:hover
    background: rgb(40,40,40) !important
</style>

<template lang="pug">
div(
  :style=`{
    //- background: isSelected ? 'rgb(45,45,45)' : 'rgb(35,35,35)',
    //- background: isOverVideo ? 'rgb(60,60,60)' : 'rgb(35,35,35)',
    background: backgroundColor,
    borderRadius: '10px',
  }`
  ).row.full-width.q-mb-sm.node-item.cursor-pointer
  //- left
  img(
    :src="composition.thumbUrl"
    :style=`{
      height: '50px',
      borderRadius: '10px',
    }`)
  //- middle
  .col
    div(
      :style=`{
        minHeight: '50px',
      }`
      ).row.fit.items-start.content-start.q-pt-xs
      //- for node
      div(
        v-if="node.items.length === 1 || node.name.length > 0"
        ).row.full-width.items-center.content-center.q-px-sm
        span.text-white {{ node.name }}
      //- for joint
      div(
        v-else
        ).row.full-width.items-center.content-center.q-px-sm
        span(v-if="node.vertices[0] !== 'ASSOCIATIVE'").text-white {{ $nodeItemType(node.vertices[contentItemIndex]).name }} - {{ $nodeItemType(node.vertices[contentItemIndex === 1 ? 0 : 1]).name }}
        span(v-else).text-white Ассоциация
        img(
          v-if="true"
          draggable="false"
          :src="node.items[contentItemIndex === 1 ? 0 : 1].thumbUrl"
          :style=`{
            height: '22px',
            maxWidth: '50px',
            objectFit: 'cover',
            borderRadius: '4px',
            opacity: 0.8,
          }`).q-ml-sm
      //- contentComposition startAt
      div(
        v-if="composition"
        ).row.full-width.q-px-sm
        small.text-grey-7 {{ $time(composition.layers[0].figuresAbsolute[0].t) }}
  //- right: node rate
  div(
    :style=`{
      minHeight: '50px',
      minWidth: '50px',
    }`
    ).row.items-center.content-center.justify-center
    node-vote-ball(
      :node="node"
      :showRateUser="false"
      :showRainbow="false"
      :showRateCounts="false"
      :showRateName="false"
      :style=`{
        opacity: 0.5
      }`)
  //- footer: for selected node
  div(
    v-if="isSelected"
    :style=`{
      //- height: '50px',
    }`
    ).row.full-width.items-center.content-center.q-pa-sm
    .col
    q-btn(
      :to="itemLink"
      round flat dense color="white" icon="launch")
</template>

<script>
import nodeVoteBall from 'components/node/node_vote_ball.vue'

export default {
  name: 'pageNodes_nodeItem',
  props: ['player', 'contentKalpa', 'node', 'composition', 'isSelected'],
  components: {
    nodeVoteBall,
  },
  computed: {
    contentItemIndex () {
      if (this.node.items.length === 1) {
        return 0
      }
      else {
        return this.node.items.findIndex(i => {
          let composition
          if (i.type === 'COMPOSITION' && i.layers) composition = i
          else if (i.type === 'NODE') composition = i.items[0]
          return composition && composition.layers[0].contentOid === this.contentKalpa.oid
        })
      }
    },
    backgroundColor () {
      // if (this.isSelected) {
      //   return 'rgb(80,80,80)'
      // }
      // else {
      //   if (this.isOverVideo) {
      //     return 'rgb(60,60,60)'
      //   }
      //   else {
      //     return 'rgb(35,35,35)'
      //   }
      // }
      if (this.isOverVideo) {
        return 'rgb(50,50,50)'
      }
      else {
        return 'rgb(35,35,35)'
      }
    },
    isOverVideo () {
      if (this.contentKalpa.type === 'VIDEO') {
        return this.player.currentTime >= this.composition.layers[0].figuresAbsolute[0].t && this.player.currentTime < this.composition.layers[0].figuresAbsolute[1].t
      }
      else {
        return false
      }
    },
    itemLink () {
      if (this.node.items.length === 1) return '/node/' + this.node.oid
      else if (this.node.items.length === 2) return '/links/' + this.node.items[this.contentItemIndex].oid
      else return '/'
    }
  },
  watch: {
    isSelected: {
      handler (to, from) {
        if (to) {
          this.player.setCurrentTime(this.composition.layers[0].figuresAbsolute[0].t)
          // this.player.play()
        }
      }
    }
  }
}
</script>
