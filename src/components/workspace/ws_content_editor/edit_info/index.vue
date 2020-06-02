<template lang="pug">
.column.fit
  //- header
  div().row.full-width
  //- body
  .col.full-width.scroll
    .row.full-width.q-pa-sm
      h1.text-white info
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
