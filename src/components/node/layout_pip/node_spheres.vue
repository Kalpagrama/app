<style lang="sass" scoped>
.sphere
  cursor: pointer
  &:hover
    background: rgb(90,90,90) !important
</style>

<template lang="pug">
div(
  :style=`{
    height: 46+'px',
  }`).row.full-width.items-center.content-center.q-px-sm.scroll
  //- spheres in nodeFull
  div(
    v-if="nodeFull"
    ).row.items-center.content-center.no-wrap
    router-link(
      v-for="(s,si) in nodeFull.spheres" :key="si"
      :to="'/sphere/'+s.oid"
      :style=`{borderRadius: 30+'px', userSelect: 'none'}`
      ).text-white.q-px-sm.q-py-xs.q-mr-xs.q-mb-xs.cursor-pointer.b-80.sphere
      small(:style=`{whiteSpace: 'nowrap'}`) {{ s.name }}
  //- mock spheres DUMMY
  div(
    v-if="!nodeFull"
    ).row.items-center.content-center.no-wrap
    div(
      v-for="(s,si) in spheres" :key="si"
      :style=`{borderRadius: 30+'px', overflow: 'hidden', userSelect: 'none'}`
      ).q-py-xs.q-px-sm.b-80.q-mr-xs
      small(:style=`{whiteSpace: 'nowrap', opacity: 0}`) {{ s.name }}
</template>

<script>
// TODO: user wsSphere to render spheres...
// false && opened && nodeFull && nodeFull.spheres.length > 9

export default {
  name: 'nodeLayoutPip-nodeSpheres',
  props: ['nodeFull'],
  data () {
    return {
      spheres: [
        // {name: 'osodf sdf sdsd s sds'},
        // {name: 'sdfsmdlfksdsdsd ds'},
        {name: 'sdfksdf sdf sd'},
        {name: 'sdfksdfsdkk'},
        {name: 'sdkksl'}
      ],
    }
  }
}
</script>
