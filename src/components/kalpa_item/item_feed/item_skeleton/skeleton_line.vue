<template lang="pug">
q-card(flat dark :style=`{width: $q.screen.width + 'px'}`)
  div(
    :style=`{
    position: 'relative',
    minHeight: '50px',
    background: 'rgb(35,35,35)',
    borderRadius: '10px',
  }`
  ).row.full-width.items-start.content-start.q-pa-sm
    .row.q-pr-sm
      q-skeleton(animation="none" dark height='50px' width='90px').br-10
    q-item-section
      q-item-label
        q-skeleton(type='text' width='95%' :animation="animation ? 'wave' : 'none'" dark)
      q-item-label(caption='')
        q-skeleton(type='text' width='80%' height='10px' animation="none" dark)
      q-item-label(caption='')
        .row
          q-skeleton(type='text' width='10%' animation="none" dark)
          .col
          q-skeleton(type='text' width='10%' animation="none" dark)
    .row.items-center.content-center
      q-icon.q-mx-xs.q-mt-sm(name='more_vert' color='grey-8' size='sm')
</template>

<script>
export default {
  name: 'skeletonLine',
  props: ['item', 'animation'],
}
</script>
