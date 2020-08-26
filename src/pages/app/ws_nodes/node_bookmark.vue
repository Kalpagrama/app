<style lang="sass" scoped>
.item
  &:hover
    background: rgb(60,60,60)
</style>

<template lang="pug">
.row.full-width.items-start.content-start.q-mb-sm
  //- default header
  div(
    @click="opened = !opened"
    :style=`{
      position: 'relative', zIndex: 10,
      height: '60px', borderRadius: '10px', overflow: 'hidden',
      cursor: 'pointer'
    }`).row.full-width.items-center.content-center.b-50.item
    img(
      :src="node.thumbOid" draggable="false"
      :style=`{
        height: '60px', borderRadius: '10px', overflow: 'hidden',
        userSelect: 'none', pointerEvents: 'none',
      }`)
    .col.full-height
      .row.fit.items-center.content-center.q-pa-md
        span(:style=`{userSelect: 'none'}`).text-white {{ node.name }}
  //- opened
  div(
    v-if="opened"
    :style=`{
      marginTop: '-10px', paddingTop: '16px',
      borderRadius: '0 0 10px 10px', overflow: 'hidden',
    }`
    ).row.full-width.items-center.content-center.q-px-sm.q-pb-sm.bg-green
    q-btn(flat color="red" no-caps @click="$emit('remove')") Delete
    .col
    q-btn(flat color="white" no-caps) Edit
</template>

<script>
export default {
  name: 'nodeBookmark',
  props: ['node'],
  data () {
    return {
      opened: false,
    }
  }
}
</script>
