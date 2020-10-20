<template lang="pug">
.row.full-width
  //- small.text-white {{ node }}
  div(
    v-if="node"
    :style=`{
      maxWidth: $store.state.ui.pageMaxWidth+'px',
      position: 'relative',
    }`
    ).row.full-width.items-center.content-center.q-py-md.q-px-sm
    //- node category goes as first sphere
    router-link(
      v-if="category"
      :to="'/sphere/'+category.sphere.oid"
      :style=`{height: '33px',borderRadius: '10px'}`
      ).row.items-center.content-center.q-px-sm.bg-blue.q-mr-xs.q-mb-xs.shaking
      q-icon(name="blur_on" color="white" size="20px").q-mr-xs
      span.text-white.q-mr-md {{ category.alias }}
    //- node spheres
    router-link(
      v-for="(s,si) in node.spheres" :key="s.oid" :to="'/sphere/'+s.oid"
      :style=`{height: '33px',borderRadius: '10px'}`
      ).row.items-center.content-center.q-px-sm.b-50.sphere-item.q-mr-xs.q-mb-xs.shaking
      q-icon(name="blur_on" color="white" size="20px").q-mr-xs
      span.text-white.q-mr-md {{ s.name }}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'viewSpheres',
  props: ['node'],
  data () {
    return {
      nodeCategories: [],
    }
  },
  computed: {
    category () {
      if (!this.node) return null
      return this.nodeCategories.find(c => c.type === this.node.category)
    },
    categoryName () {
      return this.category?.alias
    },
    categoryOid () {
      return this.category?.sphere.oid
    },
  },
  async mounted () {
    this.$log('mounted')
    this.nodeCategories = await this.$rxdb.get(RxCollectionEnum.GQL_QUERY, 'nodeCategories')
  }
}
</script>
