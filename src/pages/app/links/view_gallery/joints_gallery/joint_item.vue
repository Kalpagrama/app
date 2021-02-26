<template lang="pug">
div(
  :style=`{
  }`
  :class=`{
    'col-4': true,
    //- 'col-4': $q.screen.lt.md,
    //- 'col-3': $q.screen.gt.sm,
    //- 'col-6': $q.screen.xs,
  }`
  ).q-pa-xs
  div(
    @click="$emit('open')"
    :style=`{
      position: 'relative',
      paddingBottom: '100%',
    }`
    ).row.full-width
    div(
      :style=`{
        position: 'absolute', zIndex: 100,
      }`
      ).row.fit.items-start.content-start
      img(
        draggable="false"
        :src="joint.items[itemIndex].thumbUrl"
        :style=`{
          objectFit: 'cover',
          borderRadius: '10px',
          userSelect: 'none',
        }`
        ).fit
      //- tint
      div(
        :style=`{
          position: 'absolute', zIndex: 101,
          //- background: 'linear-gradient(0deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 100%)',
          borderRadius: '10px',
        }`
        ).row.fit.items-end.content-end.cursor-pointer
        div(
          v-if="joint.vertices[0] !== 'ASSOCIATIVE'"
          :style=`{
            background: 'linear-gradient(0deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%)',
            borderRadius: '0 0 10px 10px',
            overflow: 'hidden',
          }`
          ).row.full-width.items-center.content-center.justify-center.q-px-sm.q-pb-sm.q-pt-lg
          small(
            :style=`{
              //- whiteSpace: 'nowrap',
            }`
            ).text-white {{ jointName }}
</template>

<script>
export default {
  name: 'jointItem',
  props: ['joint', 'oid'],
  data () {
    return {}
  },
  computed: {
    itemIndex () {
      return this.joint.items.findIndex(i => i.oid !== this.oid)
    },
    jointName () {
      if (this.joint.vertices[0] === 'ESSENCE') {
        return this.joint.name
      }
      else {
        return this.$nodeItemType(this.joint.vertices[this.itemIndex]).name
      }
    }
  },
}
</script>
