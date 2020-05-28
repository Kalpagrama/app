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
  div(:style=`{}`).row.full-width.q-pa-sm
    q-input(
      v-model="searchString"
      @keyup.enter="searchStringEnter()"
      filled dark dense autofocus
      color="white"
      label="Find or create sphere"
      ).full-width
  .col.full-width.scroll
    .row.full-width.items-start.content-start.q-px-sm
      div(
        v-for="(s,si) in node.spheres" :key="si" @click="sphereClick(s,si)"
        :style=`{
          borderRadius: '10px',
          overflow: 'hidden',
        }`
        ).row.q-px-md.q-py-sm.q-mr-xs.q-mb-sm.b-80.sphere
        span.text-white {{ s.name }}
  //- div(:style=`{}`).row.full-width.q-pa-sm
</template>

<script>
// TODO: search from WS in your spheres...
export default {
  name: 'editSpheres',
  props: ['node'],
  data () {
    return {
      searchString: ''
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
      // this.$set(this.node, 'category', e.value)
      this.node.category = e.value
    },
    sphereClick (s, si) {
      this.$log('sphereClick')
      this.sphereDelete(s, si)
    },
    sphereDelete(s, si) {
      this.$log('sphereDelete')
      this.$delete(this.node.spheres, si)
    },
    async searchStringEnter () {
      this.$log('searchStringEnter')
      // check length
      if (this.searchString.length === 0) return
      // check dups
      let i = this.node.spheres.find(s => s.name === this.searchString)
      if (!i) {
        this.node.spheres.push({name: this.searchString})
      }
      this.searchString = ''
    }
  }
}
</script>
