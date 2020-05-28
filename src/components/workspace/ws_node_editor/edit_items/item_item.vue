<style lang="sass" scoped>
.item
  cursor: pointer
  &:hover
    background: rgb(90,90,90) !important
</style>

<template lang="pug">
div(
  @click="itemClick()"
  :style=`{
    position: 'relative',
    borderRadius: '10px',
    overflow: 'hidden'
  }`
  ).row.full-width.items-center.content-center.b-70.q-pl-md.q-pr-sm.q-py-sm.q-mb-sm.item
  span(:style=`{userSelect: 'none'}`).text-white {{ itemName }}
  .col
  q-btn(
    flat dense icon-right="layers" color="white"
    :style=`{pointerEvents: 'none'}`) {{ item.layers.length }}
</template>

<script>
export default {
  name: 'editItems-itemItem',
  props: ['node', 'item', 'itemIndex'],
  data () {
    return {
    }
  },
  computed: {
    itemName () {
      if (this.item.layers.length > 0) {
        if (this.item.layers[0].spheres.length > 0) {
          return this.item.layers[0].spheres[0].name
        }
        else {
          return `Item ${this.itemIndex}`
        }
      }
      else {
        return `Item ${this.itemIndex}`
      }
    }
  },
  methods: {
    itemClick () {
      this.$log('itemClick')
      this.$emit('edit')
    }
  }
}
</script>
