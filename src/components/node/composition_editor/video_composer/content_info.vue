<template lang="pug">
.column.fit
  div(:style=`{height: '60px'}`).row.full-width.items-center.content-center.q-px-md
    span.text-white {{ content.name }}
  .col.full-width.scroll
</template>

<script>
export default {
  name: 'contentInfo',
  props: ['content']
}
</script>
