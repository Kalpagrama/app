<template lang="pug">
q-page(
  :style=`{
    paddingTop: '50px',
  }`)
  .row.full-width.items-start.content-start.justify-center
    div(
      :class=`{
      }`
      :style=`{
        maxWidth: $store.state.ui.pageWidth+'px',
      }`
      ).row.full-width.items-start.content-start
      list-feed(
        v-if="sphereOid"
        :itemStyles=`{
          paddingBottom: '50px',
        }`
        :query="query")
        template(v-slot:item=`{item,itemIndex,isActive,isVisible}`)
          node-feed(
            :node="item.populatedObject"
            :isActive="isActive"
            :isVisible="isVisible")
  //- page sticky...
  q-page-sticky(
    expand position="top"
    :style=`{
      zIndex: 1000,
    }`).b-30
    .row.full-width.justify-center.b-30
      div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width.q-px-md
        q-tabs(
          :value="$route.params.oid" @input="$router.push({params: {oid: $event}})"
          dense no-caps active-color="green" switch-indicator
          ).full-width.text-grey-8
          q-tab(v-for="c in $store.state.ui.nodeCategories" :key="c.sphere.oid" :name="c.sphere.oid" :label="c.alias" dense)
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'trends_pageTrends',
  props: ['oid'],
  data () {
    return {
      category: null,
    }
  },
  computed: {
    sphereOid () {
      return this.category?.sphere.oid
    },
    query () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_ITEMS,
          objectTypeEnum: { $in: ['NODE', 'JOINT'] },
          oidSphere: this.sphereOid,
          sortStrategy: 'AGE',
        },
        populateObjects: true,
      }
    },
  },
  watch: {
    oid: {
      deep: true,
      immediate: true,
      async handler (to, from) {
        this.$log('$route CHANGED', to)
        if (to) {
          this.category = this.$store.state.ui.nodeCategories.find(c => c.sphere.oid === to)
        }
        // go to the first category: ALL
        else {
          this.$router.replace({params: {oid: this.$store.state.ui.nodeCategories[0].sphere.oid}})
        }
      }
    }
  },
}
</script>
