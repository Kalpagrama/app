<template lang="pug">
div(
  :style=`{
    position: 'relative',
    borderRadius: '10px',
    overflow: 'hidden'
  }`
  ).row.full-width.items-center.content-center.justify-between
  img(
    @click="$emit('edit')"
    :src="item.thumbOid"
    draggable="false"
    :style=`{
      userSelect: 'none',
      maxHeight: '300px',
      borderRadius: '10px',
      overflow: 'hidden',
      objectFit: 'cover',
    }`).full-width.cursor-pointer.br
  //- item name
  div(
    @click="$emit('edit')"
    :style=`{
      position: 'absolute', zIndex: 100, left: '8px', bottom: '8px',
      borderRadius: '10px', overflow: 'hidden',
      background: 'rgba(0,0,0,0.9)',
    }`
    ).row.items-center.content-center.q-pa-sm.b-50
    span.text-white.text-bold {{ itemName }}
  //- item actions
  q-btn(
    round flat icon="more_vert" color="white"
    :style=`{
      position: 'absolute', zIndex: 200,
      right: '8px', top: '8px',
      cursor: 'pointer',
      background: 'rgba(0,0,0,0.2)'
    }`)
    kalpa-menu-popup(:actions="actions")
  //- stats absolute layers
  q-btn(
    dense flat color="grey-5" no-caps
    :style=`{
      position: 'absolute', zIndex: 200,
      right: '16px', bottom: '8px',
      pointerEvents: 'none'
    }`) [layers:{{ item.layers.length }}, duration: {{ $time(compositionDuration) }}]
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
      return this.item.name
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
        delete: {
          name: 'Delete',
          fn: () => {
            this.$log('Delete')
            this.$emit('delete')
          }
        }
      }
    },
    compositionDuration () {
      return this.item.layers.reduce((acc, layer) => {
        acc += (layer.figuresAbsolute[1].t - layer.figuresAbsolute[0].t)
        return acc
      }, 0)
    }
  },
  methods: {
  }
}
</script>
