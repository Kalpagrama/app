<template lang="pug">
div(
  :style=`{
    position: 'relative',
  }`).row.full-width
  //- left
  div(
    :style=`{
      position: 'absolute', zIndex: 100, left: 0,
      width: '80px',
    }`
    ).row.full-height.br
  //- right
  div(
    :style=`{
      position: 'absolute', zIndex: 100, right: 0,
      width: '80px',
    }`
    ).row.full-height.br
  //- item NODE
  div(
    v-if="item && item.type === 'NODE'"
    ).row.fit.bg-black
    img(
      :src="item.thumbUrl"
      :style=`{
        objectFit: 'contain',
      }`
      ).fit
    //- small.text-white {{ joint }}
</template>

<script>
export default {
  name: 'pageJoints_item',
  props: ['contentKalpa', 'joint', 'ii', 'player'],
  data () {
    return {
    }
  },
  computed: {
    item () {
      // if we got two nodes...
      if (this.joint.leftItem.type === 'NODE' && this.joint.rightItem.type === 'NODE') {
        if (this.joint.leftItem.items[0].layers[0].contentOid === this.contentKalpa.oid) {
          return this.joint.rightItem
        }
        else {
          return this.joint.leftItem
        }
      }
      // if we got node and content
      // if we got two contents
      else {
        return null
      }
    }
  },
  mounted () {
    this.$log('mounted')
  }
}
</script>
