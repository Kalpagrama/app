<template lang="pug">
q-page(
  :style=`{
  }`
  ).row.full-width.items-start.content-start.justify-center
  div(:style=`{maxWidth: '800px',}`).row.full-width.items-start.content-start
    kalpa-loader(:mangoQuery="nodesQuery" @items="nodesChanged")
      template(v-slot=`{items, itemsMore}`)
        list-masonry(:items="items" :class=`{}`).q-pt-md
          template(v-slot:item=`{item}`)
            node-lite(
              :node="item"
              @click="nodeClick(item)")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'wsContentExplorer_viewNodes',
  props: ['contentKalpa', 'contentWorkspace', 'player'],
  data () {
    return {
    }
  },
  computed: {
    nodesQuery () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_NODES,
          oidSphere: this.contentKalpa.oid
        }
      }
    }
  },
  methods: {
    nodeClick (node) {
      this.$log('nodeClick', node)
      let t = node.meta.items[0].layers[0].figuresAbsolute[0].t
      this.player.setCurrentTime(t)
    },
    nodesChanged (nodes) {
      this.$log('nodesChanged', nodes)
      let layers = nodes.reduce((acc, node) => {
        node.meta.items.map(n => {
          n.layers.map(l => {
            if (l.contentOid === this.contentKalpa.oid) {
              acc.push(l)
            }
          })
        })
        return acc
      }, [])
      this.$log('nodesChanged layers', layers)
      this.$store.commit('ui/stateSet', ['wsContentLayers', JSON.parse(JSON.stringify(layers))])
    }
  }
}
</script>
