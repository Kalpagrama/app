<style lang="sass" scoped>
.menu-item
  cursor: pointer
  &:hover
    background: rgb(70,70,70) !important
</style>

<template lang="pug">
div(:style=`{position: 'relative'}`).column.fit
  //- header
  div(:style=`{height: '70px'}`).row.full-width.items-center.content-center.q-px-md
    span(:style=`{fontSize: '20px', userSelect: 'none'}`).text-white.text-bold Content editor
  //- body
  .col.full-width.scroll
    .row.full-width.items-start.content-start
      div(
        v-for="(t,ti) in tabs" :key="t.id" @click="$emit('tab', t.id)"
        :class=`{
          'b-100': tab === t.id
        }`
        :style=`{
          height: '60px',
          borderRadius: '10px',
          overflow: 'hidden',
        }`).row.full-width.items-center.content-center.q-px-md.menu-item
        span(
          :class=`{
          }`
          :style=`{
            fontSize: '16px',
            userSelect: 'none'
          }`
          ).text-white {{ t.name }}
</template>

<script>
export default {
  name: 'wsContentEditor-menuRight',
  props: ['tab', 'tabs'],
  data () {
    return {
      pageId: '',
      pages: []
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
