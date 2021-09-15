<style lang="sass" scoped>
.sphere-item
  color: white
  cursor: pointer !important
  &:hover
    color: rgb(76,175,79) !important
</style>

<template lang="pug">
.row.full-width.q-py-xs
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
      :class=`[color]`
      @click="$emit('sphere', s)"
      ).row.items-center.content-center.no-wrap.q-mr-sm.sphere-item
      //- q-icon(
        name="blur_on"
        color="grey-7"
        size="18px"
        :style=`{
          //- marginTop: '2px',
        }`)
      small ✦
      small {{ s.name }}
      small(v-if="si !== node.spheres.length-1") ,
</template>

// этот элемент показывается в virtual scroll и не может иметь состояния!!! data - запрещено! И во вложенных - тоже!!!
<script>
export default {
  name: 'essenceSpheres',
  props: {
    node: {type: Object},
    itemState: { type: Object},
    disabled: {type: Boolean, default: false},
    color: {type: String, default: 'text-grey-8'}
  }
}
</script>
