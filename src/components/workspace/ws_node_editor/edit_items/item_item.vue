<style lang="sass" scoped>
.item
  cursor: pointer
  &:hover
    background: rgb(90,90,90) !important
</style>

<template lang="pug">
div(
  :style=`{
    position: 'relative',
    height: '100px',
    borderRadius: '10px',
    overflow: 'hidden'
  }`
  ).row.full-width.items-center.content-center.justify-between.item
  img(
    :src="item.thumbUrl"
    :style=`{
      width: '180px',
      height: '100px',
      borderRadius: '10px',
      overflow: 'hidden',
      objectFit: 'cover',
    }`)
  //- middle name
  .col.full-height
    div(
      @click="itemClick()"
      ).row.fit.items-start.content-start.q-pl-md.q-py-md
      span(:style=`{userSelect: 'none'}`).text-white.text-bold {{ itemName }}
  //- right actions
  .row.full-height.items-between.content-between.q-pa-xs
      q-btn(
        @click=""
        flat dense icon="more_vert" color="grey-5"
        :style=`{}`)
        kalpa-menu-popup(:actions="actions")
  //- stats absolute layers
  q-btn(
    flat dense icon-right="layers" color="grey-5"
    :style=`{
      position: 'absolute', zIndex: 200,
      right: '4px', bottom: '4px',
      pointerEvents: 'none'
    }`) {{ item.layers.length }}
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
    },
    actions () {
      return {
        edit: {
          name: 'Edit',
          fn: () => {
            this.$log('Edit')
            this.$emit('edit')
          }
        },
        copy: {
          name: 'Copy',
          fn: () => {
            this.$log('Copy')
            this.$emit('copy')
          }
        },
        delete: {
          name: 'Delete',
          fn: () => {
            this.$log('Delete')
            this.$emit('delete')
          }
        }
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
