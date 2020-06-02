<style lang="sass" scoped>
.essence
  cursor: pointer
  &:hover
    // background: rgb(100,100,100) !important
</style>

<template lang="pug">
div(
  :style=`{
    height: '70px'
  }`
  ).row.full-width
  .col.br
    .row.fit.items-center.content-center.q-py-sm.q-pl-md
      router-link(
        :to="'/node/'+node.oid"
        :style=`{
          height: '70px',
        }`
        ).row.full-width.items-start.content-start.essence
        span(:style=`{userSelect: 'none'}`).text-white.text-bold {{ node.name }}
  div(:style=`{}`).row.full-height.items-center.content-center.justify-center.q-px-sm
    q-btn(round flat color="grey-6" icon="more_vert" @click="menuClick()")
</template>

<script>
// :class=`{
//   'b-50': !visible && !active,
//   'b-70': visible && !active,
//   'b-90': visible && active
// }`
export default {
  name: 'nodeLayoutPip-nodeEssence',
  props: ['node', 'nodeFull', 'visible', 'active', 'mini'],
  data () {
    return {
    }
  },
  methods: {
    menuClick () {
      this.$log('menuClick')
    }
  }
}
</script>
