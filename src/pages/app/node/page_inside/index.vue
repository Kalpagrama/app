<template lang="pug">
q-page(
  :style=`{
    paddingTop: '8px',
    paddingBottom: pageHeight+'px'
  }`
  ).row.full-width.justify-center
  kalpa-loader(
    :immediate="true"
    @items="nodesLoaded"
    :query="nodesQuery" v-slot=`{items,next,nexting}`)
    div(
      :style=`{
        maxWidth: $store.state.ui.pageWidth+'px',
      }`
      ).row.full-width.items-start.content-start.q-pa-sm
      node-item(
        v-for="(node, nodei) in items" :key="node.oid"
        v-if="node.items.length === 1"
        :node="node" :player="player" :contentKalpa="contentKalpa"
        :style=`{
          marginBottom: '40px',
        }`
        @clicked="nodeClick(node)")
  //- //- slot(name="prepend")
  //- div(
  //-   :style=`{
  //-     maxWidth: $store.state.ui.pageWidth+'px',
  //-   }`
  //-   ).row.full-width.items-start.content-start.q-pa-sm
  //-   slot(name="body")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'node_pageInside',
  props: ['node', 'pageHeight', 'pageWidth'],
  components: {
    nodeItem: () => import('pages/app/content/explorer_video/view_mobile_new/page_nodes/node_item.vue')
  },
  computed: {
    nodesQuery () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_ITEMS,
          objectTypeEnum: { $in: ['NODE'] },
          oidSphere: this.node.oid,
          sortStrategy: 'AGE',
        },
        populateObjects: true,
      }
      return res
    },
  },
  methods: {
    nodeClick (node) {
      this.$log('nodeClick', node)
    }
  }
}
</script>
