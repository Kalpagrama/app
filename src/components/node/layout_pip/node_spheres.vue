<style lang="sass" scoped>
.sphere
  cursor: pointer
  &:hover
    background: rgb(90,90,90) !important
</style>

<template lang="pug">
div(
  :style=`{
    height: 40+'px',
  }`).row.full-width.items-center.content-center.q-px-md
  //- div(:style=`{height: '100px', marginBottom: -openedHeight+'px'}`).row.full-width
  //- target="_blank"
  router-link(
    v-for="(s,si) in nodeFull.spheres" :key="si"
    :to="'/sphere/'+s.oid"
    :style=`{borderRadius: '10px', userSelect: 'none'}`
    ).text-white.q-px-sm.q-py-xs.q-mr-xs.q-mb-xs.cursor-pointer.b-80.sphere
    small {{ s.name }}
</template>

<script>
// TODO: user wsSphere to render spheres...
// false && opened && nodeFull && nodeFull.spheres.length > 9

export default {
  name: 'nodeLayoutPip-nodeSpheres',
  props: ['nodeFull'],
  data () {
    return {
    }
  }
}
</script>
