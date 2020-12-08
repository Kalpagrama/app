<template lang="pug">
div(
  :style=`{
    position: 'relative',
  }`
  ).row.fit
  //- small.text-white {{ item }}
  img(
    :src="item.thumbUrl"
    :style=`{
      objectFit: 'contain',
    }`
    ).fit
  //- top
  div(
    :style=`{
      position: 'absolute', zIndex: 1000, top: 0,
    }`
    ).row.full-width.items-center.content-center.justify-center.q-pa-xs
    q-btn(flat color="white" no-caps).b-30.q-px-md Причина
  //- bottom
  div(
    :style=`{
      position: 'absolute', zIndex: 1000, bottom: 0,
    }`
    ).row.full-width
    .row.full-width.justify-center.q-pa-md
      span(:style=`{fontSize: '18px',}`).text-white.text-bold {{ item.name }}
</template>

<script>
export default {
  name: 'pageOutside_joint',
  props: ['oid', 'joint'],
  computed: {
    item () {
      if (this.joint.leftItem.oid === this.oid) return this.joint.rightItem
      else return this.joint.leftItem
    },
  }
}
</script>
