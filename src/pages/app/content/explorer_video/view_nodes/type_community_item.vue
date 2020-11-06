<style lang="sass" scoped>
.node-item
  cursor: pointer
  &:hover
    background: rgb(50,50,50) !important
</style>

<template lang="pug">
div(
  @click="onClick"
  :style=`{
    minHeight: '50px',
  }`
  ).row.full-width.items-center.content-center.node-item
  img(
    draggable="false"
    :src="item.thumbUrl"
    :style=`{
      height: '50px',
      //- width: '50px',
      borderRadius: '10px',
      objectFit: 'contain',
    }`
    )
  .col.q-px-sm
    span(:style=`{userSelect: 'none'}`).text-white {{ node.name.slice(0, 48) }}
  div(
    :style=`{
      height: '50px', width: '50px',
    }`).row.items-center.content-center.justify-center
    span(:style=`{fontSize: '18px'}`).text-white.text-bold {{ Math.round((node.rate * 10) * 10) / 10  }}
</template>

<script>
export default {
  name: 'viewNodes_typeComminityItem',
  inject: ['pick'],
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
      this.player.play()
    }
  }
}
</script>
