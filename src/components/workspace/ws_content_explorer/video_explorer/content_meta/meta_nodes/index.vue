<template lang="pug">
.column.fit
  //- header
  div.row.full-width.q-px-sm
    .row.full-width.q-py-md
      span(:style=`{fontSize: '18px'}`).text-white.text-bold Nodes
    .row.full-width
  //- body
  .col.full-width.scroll
</template>

<script>
export default {
  name: 'metaNodes',
  props: ['stateExplorer'],
  data () {
    return {
    }
  }
}
</script>
