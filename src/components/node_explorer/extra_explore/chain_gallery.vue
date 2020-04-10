<template lang="pug">
.column.fit
  div(:style=`{height: '60px'}`).row.full-width.br
  .col.full-width.scroll
    div(
      v-for="(c,ci) in chains" :key="ci"
      :style=`{height: '100px'}`).row.full-width.bg
</template>

<script>
export default {
  name: 'extraExplore_chainGallery',
  props: ['node', 'chains'],
  data () {
    return {
    }
  }
}
</script>
