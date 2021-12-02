<template lang="pug">
div(:style=`{width: $q.screen.width + 'px'}`)
  div(
    :style=`{
    position: 'relative',
    minHeight: (Math.min($q.screen.width, $store.state.ui.pageWidth) / 2.2)+'px',
    background: 'rgb(35,35,35)',
    borderRadius: '10px',
  }`
  ).row.full-width.items-start.content-start
    div(:style=`{height: '45px'}`).row.full-width.q-px-sm.items-center.content-center.q-ma-none
      q-skeleton(type='circle' size="25px" animation="none" dark).q-mr-sm
      q-skeleton(type='text' width='150px' height='30px' :animation="animation ? 'wave' : 'none'" dark).br-10
      .col
      q-skeleton(type='text' width='100px' height='20px' animation="none" dark).q-mr-md
      .row.justify-center.items-center.content-center
        q-icon(name='more_vert' color='grey-8' size='sm')
    .row.full-width
        .row.full-width
          q-skeleton(:height="(Math.min($q.screen.width, $store.state.ui.pageWidth) / 2.2)+'px'" animation="none" dark square).col
          q-skeleton(v-if="item.type === 'JOINT'" :height="(Math.min($q.screen.width, $store.state.ui.pageWidth) / 2.2)+'px'" animation="none" dark square).col.q-ml-sm
        .row.full-width.text-grey.text-h6.text-bold.items-center.content-center.justify-center.q-py-md
          span {{item.name || (item.vertexType || item.verices ? $nodeItemType(item.vertexType || item.verices[0]).name : '')}}
  .row.items-center.justify-evenly.no-wrap.q-px-md.q-mb-md.q-pt-sm
    q-skeleton(type='circle' size="25px" animation="none" dark)
    q-skeleton(v-if="item.type !== 'JOINT'" type='circle' size="25px" animation="none" dark)
    q-skeleton(type='circle' size="30px" animation="none" dark)
    q-skeleton(v-if="item.type !== 'JOINT'" type='circle' size="25px" animation="none" dark)
    q-skeleton(type='circle' size="25px" animation="none" dark)
</template>

<script>
export default {
  name: 'skeletonCard',
  props: ['item', 'animation'],
}
</script>
