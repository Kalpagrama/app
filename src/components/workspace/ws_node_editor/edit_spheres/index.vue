<style lang="sass" scoped>
.sphere
  cursor: pointer
  &:hover
    background: rgb(90,90,90) !important
</style>

<template lang="pug">
div(
  :style=`{
    position: 'relative',
  }`
  ).column.fit.q-pt-sm
  //- cateory
  div().row.full-width.q-px-sm
    q-select(
      filled
      dark color="white" label="Category"
      :value="category(node.category)" @input="categorySelected"
      :options="categories"
      :style=`{
        borderRadius: '10px', overflow: 'hidden',
        minWidth: '300px', zIndex: 2000, transform: 'translate3d(0,0,0)',
      }`).full-width
  //- spheres
  .col.full-width
    ws-sphere-list(
      :showHeader="false"
      :showItems="showSpheresFromWs"
      @created="sphereCreated($event), showSpheresFromWs = false"
      @chosen="sphereChosen, showSpheresFromWs = false"
      @searchStarted="showSpheresFromWs = true"
      @searchEnded="showSpheresFromWs = false"
      ).full-height
      template(v-slot:items=`{items, searchString}`)
        div().row.full-width.items-start.content-start
          div(v-if="searchString.length === 0").row.full-width
            ws-sphere(
              v-for="(s,si) in node.spheres" :key="si"
              :sphere="s"
              @sphereClick="sphereClick(s,si)"
              ).q-mr-sm.q-mb-sm
</template>

<script>
// TODO: search from WS in your spheres...
export default {
  name: 'editSpheres',
  props: ['node'],
  data () {
    return {
      searchString: '',
      showSpheresFromWs: false
    }
  },
  computed: {
    categories () {
      return this.$store.state.node.categories.reduce((acc, val) => {
        if (val.type !== 'ALL') {
          acc.push({
            value: val.type,
            label: val.sphere.name.charAt(0).toUpperCase() + val.sphere.name.slice(1)
          })
        }
        return acc
      }, [])
    }
  },
  methods: {
    category (val) {
      return this.categories.find(c => c.value === val)
    },
    categorySelected (e) {
      this.$log('categorySelected', e)
      this.node.category = e.value
    },
    sphereCreated (s) {
      this.$log('sphereCreated', s)
      this.node.spheres.push(s)
    },
    sphereChosen (s) {
      this.$log('sphereChoosen', s)
    },
    sphereClick (s, si) {
      this.$log('sphereClick')
      this.sphereDelete(s, si)
    },
    sphereDelete(s, si) {
      this.$log('sphereDelete')
      this.$delete(this.node.spheres, si)
    }
  }
}
</script>
