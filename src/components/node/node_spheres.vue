<template lang="pug">
div(v-show="getSpheres.length > 0" :style=`{paddingLeft: '20px', paddingRight: '20px'}`).row.full-width
  //- spheres wrapper
  div(
    :style=`{
      height: showAllSpheres ? 'auto' : '20px', maxHeight: '400px',
      overflow: showAllSpheres ? 'auto' : 'hidden'}`
      ).row.full-width
    router-link(
      v-for="(s, si) in getSpheres"
      :key="si" :to="s.oid ? `/app/sphere/${s.oid}` : '/app/sphere'").q-mr-sm
      span(style=`fontSize: 12px`).text-grey-7.ksphere {{ `#${s.name}` }}
  //- more row
  div(v-if="!showAllSpheres && getSpheres.length > 3" :style=`{height: '20px'}` @click="showAllSpheres = true").row.full-width.justify-start.cursor-pointer
    small.text-grey-6.ksphere показать все сферы
</template>

<script>
export default {
  name: 'nodeSpheres',
  props: ['node', 'nodeFull', 'active'],
  data () {
    return {
      showAllSpheres: false
    }
  },
  computed: {
    getSpheres () {
      if (!this.nodeFull) return []
      // if (this.showAllSpheres) {
      //   return this.nodeFull.spheres
      // } else {
      //   return this.nodeFull.spheres.filter((s, i) => {
      //     return i < 3
      //   })
      // }
      return this.nodeFull.spheres
    }
  }
}
</script>

<style lang="stylus">
.ksphere:hover
  color: black !important
</style>
