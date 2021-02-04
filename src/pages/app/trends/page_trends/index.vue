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
      //- kalpa-loader(
        v-if="sphereOid" :query="query" :limit="12" v-slot=`{items, next, nexting}`)
        list-middle(:items="items" :itemStyles=`{marginBottom: '50px',}`)
          q-infinite-scroll(@load="next" :offset="$q.screen.height")
          template(v-slot:item=`{item,itemIndex,isActive,isVisible,width}`)
            node-feed(:node="item.populatedObject" :isActive="isActive" :isVisible="isVisible" :width="width")
          template(v-slot:append)
            div(:style=`{height: '50px'}`).row.full-width.justify-center
              q-spinner-dots(v-show="nexting" color="green" size="50px")
      list-feed(
        v-if="sphereOid"
        :itemStyles=`{
          paddingBottom: '50px',
        }`
        :query="query")
        template(v-slot:item=`{item,itemIndex,isActive,isVisible,width}`)
          node-feed(
            :node="item.populatedObject"
            :isActive="isActive"
            :isVisible="isVisible")
  q-page-sticky(
    expand position="top"
    :style=`{
      zIndex: 1000,
      //- paddingTop: headerRevealed ? '0px' : 'env(safe-area-inset-top)'
    }`).b-30
    .row.full-width.justify-center.b-30
      div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width.q-px-md
        q-tabs(
          :value="$route.params.oid" @input="$router.push({params: {oid: $event}})"
          dense no-caps active-color="green" switch-indicator
          ).full-width.text-grey-8
          q-tab(v-for="c in nodeCategories" :key="c.sphere.oid" :name="c.sphere.oid" :label="c.alias" dense)
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'trends_pageTrends',
  props: ['oid', 'headerRevealed'],
  data () {
    return {
      nodeCategories: [],
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
        if (this.nodeCategories.length === 0) this.nodeCategories = await this.$rxdb.get(RxCollectionEnum.GQL_QUERY, 'nodeCategories')
        if (to) {
          this.category = this.nodeCategories.find(c => c.sphere.oid === to)
        }
        // go to the first category: ALL
        else {
          this.$router.replace({params: {oid: this.nodeCategories[0].sphere.oid}})
        }
      }
    }
  },
}
</script>
