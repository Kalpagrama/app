<template lang="pug">
div(
  :style=`{
    position: 'absolute', zIndex: 1000,
    pointerEvents: 'none',
    borderRadius: '10px',
    overflow: 'hidden',
  }`
  ).row.fit
  //- figures
  //- div(
    v-for="(f,fi) in player.figures" :key="fi"
    :style=`{
      position: 'absolute', zIndex: 1000+fi,
      left: (f.figures[0].t/player.duration)*100+'%',
      width: ((f.figures[1].t-f.figures[0].t)/player.duration)*100+'%',
      height: '100%',
      //- background: 'rgba(200,200,200,0.3)',
      background: $rateMeta.find(r => f.node.rate >= r.valueMin && f.node.rate < r.valueMax).colorBackground,
      opacity: 0.2,
      pointerEvents: 'none',
    }`
    ).row
  div(
    v-for="(cluster,clusterIndex) in player.clusters" :key="clusterIndex"
    v-if="cluster.figuresAbsolute.length > 0"
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
  name: 'clusters',
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
