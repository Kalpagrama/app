<style lang="sass">
.node-item
  &:hover
    background: rgb(40,40,40) !important
</style>

<template lang="pug">
div(
  :class=`{
    'node-item': !isSelected,
  }`
  :style=`{
    //- background: backgroundColor,
    position: 'relative',
    borderRadius: '10px',
    overflow: 'hidden',
  }`
  ).row.full-width.cursor-pointer
  //- default header
  div(
    @click="$emit('select')"
    :style=`{
      position: 'relative', zIndex: 10,
      //- borderRadius: '10px',
      background: backgroundColor,
    }`
    ).row.full-width
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
      position: 'relative', zIndex: 10,
      borderRadius: '0 0 10px 10px',
      background: backgroundColor,
    }`
    ).row.full-width.items-center.content-center.justify-between.q-pa-sm
    q-btn(
      @click="nodeRefresh()"
      round flat dense color="white" icon="refresh")
    //- .col
    q-btn(
      @click="isOpened = true"
      round flat dense color="white" icon="open_in_full")
    q-btn(
      :to="itemLink"
      round flat dense color="white" icon="launch")
  //- item creating progress
  div(
    v-if="['BLANK', 'UPLOAD_LOW_QUALITY', 'ERROR'].includes(node.uploadStage)"
    :style=`{
      position: 'relative',
      //- height: '40px',
      borderRadius: '0 0 10px 10px',
      marginTop: '-20px',
      paddingTop: '28px',
    }`
    ).row.full-width.items-center.content-center.justify-center.bg-green.q-px-sm.q-pb-sm
    q-spinner(v-if="node.uploadStage === 'BLANK'" size="30px" color="white")
    div(v-if="node.uploadStageProgress < 100"
      :style=`{
        position: 'absolute', zIndex: 100,
        left: '0px',
        width: node.uploadStageProgress+'%',
        height: '100%',
        background: 'rgba(255,255,255,0.5)',
        pointerEvents: 'none',
      }`)
</template>

<script>
import { ObjectApi } from 'src/api/object'

import nodeVoteBall from 'components/node/node_vote_ball.vue'

export default {
  name: 'pageNodes_nodeItem',
  props: ['player', 'contentKalpa', 'node', 'composition', 'isSelected'],
  components: {
    nodeVoteBall,
  },
  data () {
    return {
      isActiveStart: 0,
      isOpened: false,
    }
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
      if (this.isSelected) {
        return 'rgb(80,80,80)'
      }
      else {
        // if (this.isOverVideo) {
        //   return 'rgb(50,50,50)'
        // }
        // else {
        //   return 'rgb(35,35,35)'
        // }
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
      else if (this.node.items.length === 2) return '/graph/' + this.node.items[this.contentItemIndex].oid
      else return '/'
    }
  },
  watch: {
    isSelected: {
      immediate: true,
      async handler (to, from) {
        this.$log('isSelected', to)
        if (to) {
          // handle player
          // TODO: player.setNodeWatcher = node.oid/node
          if (this.contentKalpa.type === 'VIDEO') {
            this.nodeRefresh()
          }
          // handle views
          this.isActiveStart = Date.now()
        }
        else if (this.isActiveStart){
          // handle views
          let statValue = Date.now() - this.isActiveStart
          this.$log('statValue', statValue)
          let stat = await ObjectApi.updateStat(this.node.oid, 'VIEWED_TIME', statValue)
          this.isActiveStart = 0
        }
      }
    }
  },
  methods: {
    nodeRefresh () {
      this.$log('nodeRefresh')
      if (this.contentKalpa.type === 'VIDEO') {
        this.player.setCurrentTime(this.composition.layers[0].figuresAbsolute[0].t)
        this.player.play()
      }
    }
  }
}
</script>
