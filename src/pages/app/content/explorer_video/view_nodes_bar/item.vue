<template lang="pug">
div(
  :style=`{
    position: 'absolute',
    height: nodeClosest ? '60px' : '40px',
    zIndex: nodeClosest ? 1000 : 10+nodeIndex,
    //- border: nodeClosest ? '1px solid red' : 'none',
    left: (item.layers[0].figuresAbsolute[0].t / contentKalpa.duration) * 100 + '%',
  }`
  ).row.items-start.content-start
  //- connection line
  div(
    :style=`{
      position: 'absolute', left: '0px', top: '-20px', zIndex: 1,
      height: nodeClosest ? '60px' : '40px',
      width: '2px',
      opacity: 0.4
    }`
    ).row.bg-white
  div(
    :style=`{
      position: 'absolute', top: '-20px', zIndex: 1,
      height: nodeClosest ? '60px' : '40px',
      width: '2px',
      opacity: 0.4,
      left: (item.layers[0].figuresAbsolute[1].t-item.layers[0].figuresAbsolute[1].t) / contentKalpa.duration * 100 + '%',
    }`
    ).row.bg-white
  //- preview
  img(
    :src="item.thumbUrl"
    :style=`{
      zIndex: 2,
      borderRadius: '10px',
      height: nodeClosest ? '60px' : '40px',
      userSelect: 'none',
      borderRadius: '10px',
    }`
  )
  div(
    v-if="nodeClosest"
    :style=`{
      userSelect: 'none',
    }`
    ).row.full-width.q-px-xs
    small.text-white.text-bold.q-mr-xs {{ Math.round((node.rate * 10) * 10) / 10  }}
    small.text-white {{ node.name }}
</template>

<script>
export default {
  name: 'viewNodesBar_Item',
  props: ['player', 'contentKalpa', 'contentBookmark', 'node', 'nodeIndex', 'nodeClosest'],
  data () {
    return {
    }
  },
  computed: {
    item () {
      return this.node.items.find(item => {
        return item.layers[0].contentOid === this.contentKalpa.oid
      })
    },
    itemDuration () {
      return this.item.figuresAbsolute[1].t - this.item.figuresAbsolute[0].t
    },
    itemDurationPercent () {
      return this.itemDuration / this.contentKalpa.duration
    }
  }
}
</script>
