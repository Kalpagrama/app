<style lang="sass">
.node-item
  &:hover
    background: rgb(40,40,40) !important
</style>

<template lang="pug">
.row.full-width
  //- body new
  div(
    @click="onClick"
    :style=`{
      position: 'relative', zIndex: 10,
      background: 'rgb(35,35,35)',
      borderRadius: '10px',
      minHeight: '50px',
    }`
    ).row.full-width.items-start.content-start.justify-start.node-item.cursor-pointer
    //- left: contentItem thumbUrl
    div(
      :style=`{
        position: 'relative',
        height: '50px',
      }`
      ).row
      img(
        v-if="contentItem"
        draggable="false"
        :src="contentItem.thumbUrl"
        :style=`{
          zIndex: 200,
          height: '50px',
          borderRadius: '10px',
        }`)
    //- middle: names, times, joints
    .col
      div(:style=`{minHeight: '50px',}`).row.fit.items-center.content-center
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
          span(v-else).text-white {{$t('Association')}}
          img(
            v-if="jointItem"
            draggable="false"
            :src="jointItem.thumbUrl"
            :style=`{
              height: '22px',
              borderRadius: '4px',
              opacity: 0.8,
            }`).q-ml-sm
        //- contentComposition startAt
        div(
          v-if="contentComposition"
          ).row.full-width.q-px-sm
          small.text-grey-6 {{ $time(contentComposition.layers[0].figuresAbsolute[0].t) }}
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
</template>

<script>
export default {
  name: 'pageNodes_item',
  props: ['node', 'player', 'contentKalpa', 'nodeSelected', 'isActive', 'isSelected', 'isVisible'],
  components: {
    nodeVoteBall: () => import('components/node/node_vote_ball.vue'),
  },
  data () {
    return {
      figures: [],
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
    contentItem () {
      return this.node.items[this.contentItemIndex]
    },
    contentComposition () {
      if (this.contentItem.type === 'NODE') {
        return this.contentItem.items[0]
      }
      else if (this.contentItem.type === 'COMPOSITION') {
        return this.contentItem
      }
      else {
        return null
      }
    },
    jointItem () {
      if (this.node.items.length === 1) return null
      else {
        return this.node.items[this.contentItemIndex === 1 ? 0 : 1]
      }
    },
  },
  watch: {
  },
  methods: {
    onClick (e) {
      this.$log('onClick', e)
      this.$emit('select')
    }
  }
}
</script>
