<template lang="pug">
div().row.full-width.items-start.content-start
  img(
    :src="item.thumbUrl"
    :style=`{
      borderRadius: '10px',
      objectFit: 'cover',
    }`
    ).fit
  //- header
  div(
    v-if="itemVertex.id !== 'ASSOCIATIVE'"
    :style=`{
      position: 'absolute', zIndex: 100, top: '0px',
    }`
    ).row.full-width.q-pa-sm
    span.text-white {{ itemVertex.name }}
  //- footer
  div(
    :style=`{
      position: 'absolute', zIndex: 100, bottom: '0px',
      overflow: 'hidden'
    }`
    ).row.full-width.items-center.content-center.no-wrap.q-pa-sm
    div(
      :style=`{
        overflow: 'hidden',
      }`
      ).row.full-width.items-center.content-center.no-wrap
      q-icon(name="adjust" color="white").q-mr-sm
      span(:style=`{whiteSpace: 'nowrap'}`).text-white {{ item.name }}
  //- tint
  div(
    :style=`{
      position: 'absolute', zIndex: 90,
      background: 'rgba(0,0,0,0.5)',
      borderRadius: '10px',
    }`
    ).row.fit
</template>

<script>
export default {
  name: 'jointItem',
  props: ['oid', 'joint'],
  data () {
    return {
    }
  },
  computed: {
    itemIndex () {
      return this.joint.items.findIndex(i => i.oid !== this.oid)
    },
    item () {
      return this.joint.items[this.itemIndex]
    },
    itemVertex () {
      return this.$nodeItemType(this.joint.vertices[this.itemIndex])
    }
  },
}
</script>
