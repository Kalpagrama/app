<template lang="pug">
.row.full-width
  .row.full-width.scroll.q-py-md
    .row.full-width.no-wrap
      div(
        :style=`{
          minWidth: '50%',
          maxWidth: '50%'
        }`
        ).row
      div(
        :style=`{
          position: 'relative',
          //- borderRadius: '10px',
          //- overflow: 'hidden',
        }`
        ).row.no-wrap.br
        //- currentTime
        div(
          :style=`{
            position: 'absolute', zIndex: 100,
            left: (player.currentTime/player.duration)*100+'%',
            top: '-4px', height: 'calc(100% + 8px)',
            width: '4px',
            borderRadius: '2px',
          }`
          ).bg-green
        img(
          v-for="(s,si) in contentKalpa.strips" :key="si"
          draggable="false"
          :src="s"
          :style=`{
            //- borderRadius: '10px',
          }`)
      div(
        :style=`{
          minWidth: '50%',
          maxWidth: '50%'
        }`
        ).row
</template>

<script>
export default {
  name: 'layerStrips',
  props: ['player', 'composition', 'contentKalpa'],
}
</script>
