<style lang="sass" scoped>
.node-item
  cursor: pointer
  &:hover
    background: rgb(50,50,50) !important
</style>

<template lang="pug">
.row.full-width.items-start.content-start
  div(
    :style=`{
      position: 'relative', zIndex: 100,
      borderRadius: '10px', overflow: 'hidden',
    }`
    ).row.full-width.b-40.node-item
    div(
      :style=`{
        position: 'relative', zIndex: 100,
        height: 0, paddingBottom: '100%',
        borderRadius: '10px', overflow: 'hidden',
      }`
      ).full-width
      div(:style=`{position: 'absolute', top: 0, left: 0, bottom: 0, right: 0,}`).row
        img(
          v-if="node.items.length > 0"
          draggable="false"
          :src="node.items[0].thumbUrl"
          :style=`{objectFit: 'cover'}`).fit
        div(
          v-else
          :style=`{borderRadius: '10px', overflow: 'hidden'}`
          ).row.fit.b-50
    //- essense
    div(
      v-show="node.name.length > 0"
      :style=`{
        textAlign: 'center',
      }`
      ).row.full-width.justify-center.q-pa-sm
      small(
        v-if="node.name.length > 0"
        :style=`{userSelect: 'none',}`).text-white {{ nodeName }}
</template>

<script>
export default {
  name: 'wsNodeItem',
  props: ['node'],
  data () {
    return {
    }
  },
  computed: {
    nodeName () {
      if (this.node.name.length > 80) return this.node.name.slice(0, 80) + '...'
      else return this.node.name
    }
  },
}
</script>
