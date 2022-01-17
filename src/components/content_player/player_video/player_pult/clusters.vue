<template lang="pug">
.row.fit
  //- cluster wrapper
  div(
    v-for="(cluster,clusterIndex) in player.clusters.filter(c => c.figuresAbsolute.length > 0)" :key="clusterIndex"
    :style=`{
    position: 'absolute', zIndex: clusterIndex,
    left: (cluster.figuresAbsolute[0].t/player.duration)*100+'%',
    width: ((cluster.figuresAbsolute[1].t-cluster.figuresAbsolute[0].t)/player.duration)*100+'%',
    height: '100%',
    pointerEvents: 'none',
    overflow: 'hidden',
    background: 'rgba(255,255,255,'+clusterOpacity(cluster)+')',
    borderRadius: clusterBorderRadius(clusterIndex),
  }`
  ).row.items-center.content-center.justify-center
    //div(
    //  :style=`{
    //    position: 'absolute', zIndex: 100,
    //    top: '-50px', left: '0px',
    //    width: '50px', height: '50px',
    //  }`
    //  ).row.bg-red.bg
    //- small.text-white {{ cluster.totalCount }}
</template>

<script>
export default {
  name: 'nodeClusters',
  props: ['player', 'contentKalpa', 'br'],
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
      let leftBr = clusterIndex === 0
      let rightBr = clusterIndex === this.player.clusters.length - 1
      let br = this.br || '5px'
      return `${leftBr ? br : '0'} ${rightBr ? br : '0'} ${rightBr ? br : '0'} ${leftBr ? br : '0'}`
    },
    clusterOpacity (cluster) {
      // ((cluster.totalCount/clustersTotalCount)+0.1)
      let r = cluster.totalCount / this.clustersTotalCount
      return Math.min(r, 0.6)
    }
  }
}
</script>
