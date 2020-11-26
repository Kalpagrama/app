<template lang="pug">
q-page(
  :style=`{
    paddingTop: '8px',
    paddingBottom: '100vh',
  }`
  ).row.full-width.justify-center
  kalpa-loader(
    :immediate="true"
    @items="nodesLoaded"
    :query="nodesQuery" v-slot=`{items,next,nexting}`)
    div(
      :style=`{
        maxWidth: '100%',
      }`
      ).row.full-width.items-start.content-start.q-pa-sm
      node-item(
        v-for="(node, nodei) in items" :key="node.oid"
        :node="node" :player="player" :contentKalpa="contentKalpa"
        :style=`{
          marginBottom: '40px',
        }`
        @clicked="nodeClick(node)")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import nodeItem from './node_item.vue'

export default {
  name: 'pageNodes',
  props: ['contentKalpa', 'player'],
  components: {
    nodeItem,
  },
  computed: {
    nodesQuery () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_ITEMS,
          objectTypeEnum: { $in: ['NODE'] },
          oidSphere: this.contentKalpa.oid,
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
      let start = node.items[0].layers[0].figuresAbsolute[0].t
      this.player.setCurrentTime(start)
      this.player.play()
    },
    nodesLoaded (nodes) {
      this.$emit('figures')
      this.$log('figuresUpdate', nodes.length)
      // get figures
      let figures = nodes.reduce((acc, node) => {
        node.items.map(i => {
          if (i.layers[0].contentOid === this.contentKalpa.oid) {
            let figureInput = i.layers[0].figuresAbsolute[0]
            acc.push([figureInput])
          }
        })
        return acc
      }, [])
      this.$emit('figures', figures)
    }
  }
}
</script>
