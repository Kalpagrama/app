<style lang="sass" scoped>
.sphere-item
  &:hover
    color: rgb(76,175,79) !important
</style>

<template lang="pug">
.row.full-width.q-px-sm.q-py-xs
  .row.full-width.scroll.q-pl-sm
    component(
      v-for="(s,si) in node.spheres" :key="si"
      :is="disabled ? 'div' : 'router-link'"
      :to="'/sphere/'+s.oid"
      :style=`{
        marginLeft: '2px',
        whiteSpace: 'nowrap',
        background: 'none !important',
      }`
      @click="$emit('sphere', s)"
      ).row.items-center.content-center.text-grey-7.no-wrap.q-mr-sm.sphere-item
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
  props: {
    node: {type: Object},
    disabled: {type: Boolean, default: false},
  }
}
</script>
