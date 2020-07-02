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
  div().row.full-width.q-mb-sm
    q-select(
      filled
      dark color="white"
      :label="$t('Выбери категорию')"
      :value="category(node.category)" @input="categorySelected"
      :options="categories"
      :style=`{
        borderRadius: $store.state.ui.borderRadius+'px', overflow: 'hidden',
        minWidth: '300px', zIndex: 2000, transform: 'translate3d(0,0,0)',
      }`).full-width
  //- spheres
  .col.full-width.q-pb-sm
    ws-sphere-list(
      :showHeader="false"
      :showItems="showSpheresFromWs"
      @sphereClick="sphereClickWs($event), showSpheresFromWs = false"
      @created="sphereCreated($event), showSpheresFromWs = false"
      @searchStarted="showSpheresFromWs = true"
      @searchEnded="showSpheresFromWs = false"
      :style=`{
        borderRadius: $store.state.ui.borderRadius+'px',
        overflow: 'hidden',
      }`).full-height.b-50
      template(v-slot:header)
        .row.full-width.q-px-sm.q-py-md
          span.text-white.text-bold {{$t('Spheres')}}
      template(v-slot:items=`{items, searchString}`)
        div().row.full-width.items-start.content-start
          div(v-if="searchString.length === 0").row.full-width.q-py-sm
            ws-sphere(
              v-for="(s,si) in node.spheres" :key="si"
              :sphere="s"
              @sphereClick="sphereClick(s,si)"
              ).q-mr-sm.q-mb-sm
</template>

<script>
// TODO: search from WS in your spheres...
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'editSpheres',
  props: ['storeNodeEditor', 'node'],
  data () {
    return {
      nodeCategories: [],
      searchString: '',
      showSpheresFromWs: false
    }
  },
  computed: {
    categories () {
      return this.nodeCategories.reduce((acc, val) => {
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
      this.sphereAdd(s)
    },
    sphereClick (s, si) {
      this.$log('sphereClick')
      this.sphereDelete(s, si)
    },
    sphereClickWs (s) {
      this.$log('sphereClickWs', s)
      this.sphereAdd(s)
    },
    sphereAdd (s) {
      this.$log('sphereAdd', s)
      let i = this.node.spheres.findIndex(sphere => sphere.name === s.name)
      if (i >= 0) return
      this.node.spheres.push(s)
    },
    sphereDelete(s, si) {
      this.$log('sphereDelete')
      this.$delete(this.node.spheres, si)
    }
  },
  async beforeCreate () {
    this.$log('beforeCreate')
    this.nodeCategories = await this.$rxdb.get(RxCollectionEnum.OTHER, 'nodeCategories')
  }
}
</script>
