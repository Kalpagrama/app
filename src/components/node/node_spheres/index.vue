<template lang="pug">
.row.full-width.q-px-sm.q-py-xs
  .row.full-width.scroll
    div(
      v-for="(s,si) in node.spheres" :key="si"
      :style=`{
        marginLeft: '2px',
        whiteSpace: 'nowrap',
      }`
      ).row.items-center.content-center.text-grey-7.no-wrap.q-mr-sm
      //- q-icon(
        name="blur_on"
        color="grey-7"
        size="18px"
        :style=`{
          //- marginTop: '2px',
        }`)
      small #
      small {{ s.name }}
      small(v-if="si !== node.spheres.length-1") ,
</template>

<script>
export default {
  name: 'nodeSpheres',
  props: ['node'],
}
</script>
