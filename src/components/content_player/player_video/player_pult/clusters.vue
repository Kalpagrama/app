<template lang="pug">
div(
  :style=`{
    position: 'absolute', zIndex: 1000,
    pointerEvents: 'none',
    borderRadius: '10px',
    overflow: 'hidden',
  }`
  ).row.fit
  //- cluster wrapper
  div(
    v-for="(cluster,clusterIndex) in player.clusters.filter(c => c.figuresAbsolute.length > 0)" :key="clusterIndex"
    :style=`{
      position: 'absolute', zIndex: 1000+clusterIndex,
      left: (cluster.figuresAbsolute[0].t/player.duration)*100+'%',
      width: ((cluster.figuresAbsolute[1].t-cluster.figuresAbsolute[0].t)/player.duration)*100+'%',
      height: '100%',
      pointerEvents: 'none',
      overflow: 'hidden',
      background: 'rgba(255,255,255,'+clusterOpacity(cluster)+')',
      borderRadius: clusterBorderRadius(clusterIndex),
    }`
    ).row.items-center.content-center.justify-center
    div(
      :style=`{
        position: 'absolute', zIndex: 100,
        top: '-50px', left: '0px',
        width: '50px', height: '50px',
      }`
      ).row.bg-red.bg
    //- small.text-white {{ cluster.totalCount }}
</template>

<script>
export default {
  name: 'nodeClusters',
  props: ['player', 'contentKalpa'],
  computed: {
    clustersTotalCount () {
      return this.player.clusters.reduce((acc, val) => {
        acc += val.totalCount
        return acc
      }, 0)
    }
  },
  methods: {
    clusterBorderRadius (clusterIndex) {
      if (clusterIndex === 0) {
        return '10px 0 0 10px'
      }
      else if (clusterIndex === this.player.clusters.length - 1) {
        return '0 10px 10px 0'
      }
      else {
        return '0px'
      }
    },
    clusterOpacity (cluster) {
      // ((cluster.totalCount/clustersTotalCount)+0.1)
      let r = cluster.totalCount / this.clustersTotalCount
      return Math.min(r, 0.6)
    }
  }
}
</script>
