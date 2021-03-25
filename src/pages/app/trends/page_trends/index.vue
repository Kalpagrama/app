<template lang="pug">
.row.full-width.items-start.content-start.justify-center.q-pt-sm
  div(
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
          // objectTypeEnum: { $in: ['NODE'] },
          oidSphere: this.sphereOid,
          sortStrategy: 'HOT',
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
