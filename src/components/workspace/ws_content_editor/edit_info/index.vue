<template lang="pug">
.column.fit
  //- header
  div().row.full-width
  //- body
  .col.full-width.scroll
    .row.full-width.q-pa-sm
      h1.text-white info
  //- footer
  div(
    :style=`{
      borderRadius: $q.screen.gt.xs ? '10px' : '10px 10px 0 0',
    }`
    ).row.full-width.items-end.content-end.q-pb-sm.q-px-sm.b-50.justify-center
    kalpa-buttons(:value="pages" :id="pageId" idKey="id" @id="$emit('pageId', $event)")
</template>

<script>
export default {
  name: 'editInfo',
  props: ['pages', 'pageId'],
  data () {
    return {
    }
  }
}
</script>
