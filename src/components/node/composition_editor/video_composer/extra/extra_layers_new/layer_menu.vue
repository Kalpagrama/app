<style lang="sass" scoped>
.item
  cursor: pointer
  border-radius: 10px
  overflow: hidden
  &:hover
    background: rgb(120,120,120)
</style>

<template lang="pug">
.row.full-width.b-100
  div(
    v-for="(i,ii) in items" :key="i.id" @click="itemClick(i, ii)"
    :style=`{height: '30px'}`
    ).row.full-width.items-center.content-center.item.q-px-md
    span(:style=`{userSelect: 'none'}`).text-white {{i.name}}
</template>

<script>
export default {
  name: 'extraLayers-layerMenu',
  data () {
    return {
      items: [
        {id: 'edit', name: 'Edit'},
        {id: 'copy', name: 'Copy'},
        {id: 'delete', name: 'Delete'},
      ]
    }
  },
  methods: {
    itemClick (i, ii) {
      this.$log('itemClick', i.id)
      this.$emit(i.id)
    }
  }
}
</script>
