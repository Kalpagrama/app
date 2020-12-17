<template lang="pug">
div(
  :style=`{
    position: 'relative',
    borderRadius: '10px',
  }`).row.full-width.items-center.content-center.b-40.cursor-pointer
  slot
  img(
    draggable="false"
    :src="item.thumbUrl"
    :style=`{
      width: '40px',
      height: '40px',
      borderRadius: '10px',
      objectFit: 'cover',
    }`)
  .col.q-pr-sm
    div(
      :style=`{
        overflow: 'hidden',
      }`
      ).row.full-width.q-px-sm
      small(
        :style=`{
          userSelect: 'none',
          whiteSpace: 'nowrap',
        }`).text-white {{ jointName }}
</template>

<script>
// TODO: handle: NODE, Composition, JOINT?, VIDEO, IMAGE, GIF, SPHERE, USER

export default {
  name: 'jointItem',
  props: ['joint', 'itemIndex', 'itemOid'],
  data () {
    return {
    }
  },
  computed: {
    itemIndexLocal () {
      return this.itemIndex || this.joint.items.findIndex(i => i.oid !== this.itemOid)
    },
    item () {
      return this.joint.items[this.itemIndexLocal]
    },
    itemName () {
      if (this.item.__typename === 'Composition') {
        return 'Composition'
      }
      else {
        return this.item.name
      }
    },
    jointName () {
      if (this.joint.name) return this.joint.name
      else {
        let vertex = this.joint.vertices[this.itemIndexLocal]
        if (vertex) {
          if (vertex === 'ASSOCIATIVE') {
            return this.itemName
          }
          else {
            return this.$nodeItemType(vertex).name
          }
        }
        else {
          return ''
        }
      }
    },
  }
}
</script>
