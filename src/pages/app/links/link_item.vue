<template lang="pug">
div(
  :style=`{
    position: 'relative',
    borderRadius: '10px',
  }`).row.items-center.content-center.b-40.cursor-pointer
  img(
    draggable="false"
    :src="item.thumbUrl"
    :style=`{
      width: '40px',
      height: '40px',
      borderRadius: '10px',
      objectFit: 'cover',
    }`)
  .col
    .row.full-width.q-px-sm
      small(:style=`{userSelect: 'none'}`) {{ itemName }}
</template>

<script>
// TODO: handle: NODE, Composition, JOINT?, VIDEO, IMAGE, GIF, SPHERE, USER

export default {
  name: 'linkItem',
  props: ['item'],
  data () {
    return {
    }
  },
  computed: {
    itemName () {
      if (this.item.__typename === 'Composition') {
        return 'Composition'
      }
      else {
        return this.item.name
      }
    }
  }
}
</script>
