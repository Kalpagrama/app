<style lang="sass" scoped>
.node-item
  cursor: pointer
  &:hover
    background: rgb(50,50,50)
</style>

<template lang="pug">
div(
  @click="onClick"
  :style=`{
    position: 'relative',
    zIndex: 100,
    borderRadius: '10px', overflow: 'hidden',
  }`
  ).row.full-width.items-start.content-start.node-item.b-40
  img(
    v-if="item"
    :src="item.thumbUrl"
    draggable="false"
    :style=`{
      objectFit: 'contain',
      borderRadius: '10px', overflow: 'hidden',
      pointerEvents: 'none',
    }`
    ).full-width
  .row.full-width.items-center.content-center.justify-center.q-pa-sm
    small(:style=`{userSelect: 'none'}`).text-white {{ node.name }}
</template>

<script>
export default {
  name: 'contentExplorerVideo_viewNodesAll',
  props: ['contentKalpa', 'player', 'node', 'isSelected'],
  data () {
    return {
    }
  },
  computed: {
    // находим первую грань для входа и просмотра ядра
    item () {
      return this.node.items.find(item => {
        return item.layers[0].contentOid === this.contentKalpa.oid
      })
    }
  },
  methods: {
    onClick () {
      this.$log('onClick')
      this.$emit('toggleSelect')
      let t = this.item.layers[0].figuresAbsolute[0].t
      this.player.setCurrentTime(t)
    }
  }
}
</script>
