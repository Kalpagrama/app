<template lang="pug">
.column.fit
  .row.full-width.q-px-sm
    div(v-if="resizable").row.full-width.q-py-md
      span(:style=`{fontSize: '18px'}`).text-white.text-bold Info
  .col.full-width
</template>

<script>
export default {
  name: 'metaInfo',
  props: ['stateExplorer', 'resizable'],
  data () {
    return {
    }
  }
}
</script>
