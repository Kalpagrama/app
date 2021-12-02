<template lang="pug">
div(:style=`{width: 150*1.618+'px', height: '150px'}`).relative-position
  q-skeleton(type='rect' height='100%' animation='none' dark).br-10
  .row.full-width.absolute-bottom.justify-center.q-px-md
    span.text-grey-5.ellipsis {{item.name}}
</template>

<script>
export default {
  name: 'skeletonCardTiny',
  props: ['item', 'animation'],
}
</script>
