<template lang="pug">
q-page(
  :style=`{
    paddingTop: '8px',
    paddingBottom: '100vh',
  }`
  ).row.full-width.justify-center
  kalpa-loader(
    :immediate="true"
    :query="nodesQuery" @items="nodesLoaded" v-slot=`{items,next,nexting}`)
    div(
      :style=`{
        //- maxWidth: $store.state.ui.pageWidth+'px',
        maxWidth: '100%',
      }`
      ).row.full-width.items-start.content-start.q-pa-sm
      item(
        v-for="(node,nodei) in items" :key="node.oid"
        :node="node" :player="player" :contentKalpa="contentKalpa")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import item from './item.vue'

export default {
  name: 'pageNodes',
  props: ['contentKalpa', 'player'],
  components: {
    item
  },
  computed: {
    nodesQuery () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_NODES,
          oidSphere: this.contentKalpa.oid
        },
        populateObjects: true,
      }
      // if (this.onlyMine) {
      //   res.selector.oidAuthor = {$eq: this.$store.getters.currentUser().oid}
      // }
      return res
    },
  },
  methods: {
    nodeClick (node) {
      this.$log('nodeClick', node)
      let start = node.items[0].layers[0].figuresAbsolute[0].t
      this.player.setCurrentTime(start)
      this.player.play()
    }
  }
}
</script>
