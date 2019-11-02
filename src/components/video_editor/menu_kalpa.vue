<template lang="pug">
.column.fit.bg-white
  //- header
  div(:style=`{height: '60px'}`).row.full-width.items-center
    .col
    div(:style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
      q-btn(round flat icon="keyboard_arrow_down" @click="$emit('hide')")
  //- body
  .col.full-width.scroll
    .row.full-width.items-start.content-start
      h1 content nodes
</template>

<script>
export default {
  name: 'videoEditor__menuKalpa',
  data () {
    return {
    }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
