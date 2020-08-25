<template lang="pug">
kalpa-loader(:mangoQuery="nodesQuery" @items="nodesLoaded")
  template(v-slot=`{items, itemsMore}`)
    list-masonry(:items="items" :class=`{'q-px-sm': $q.screen.width < 800}`)
      template(v-slot:item=`{item}`)
        node-lite(:node="item")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import nodesBar from './nodes_bar.vue'

export default {
  name: 'wsContentExplorer_videoExplorer_pageNodes',
  components: {nodesBar},
  props: ['mode', 'contentWorkspace', 'contentKalpa'],
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
      // this.$router.push(`/node/${node.oid}`)
      let t = node.meta.items[0].layers[0].figuresAbsolute[0].t
      this.$emit('setCurrentTime', t)
    },
    nodesLoaded (nodes) {
      this.$log('nodesLoaded!')
      let bars = nodes.reduce((acc, val) => {
        let layer = val.meta.items[0].layers[0]
        if (layer.contentOid === this.contentKalpa.oid) {
          acc.push(layer.figuresAbsolute[0].t)
        }
        return acc
      }, [])
      // this.$log('bars', bars)
      this.$emit('bars', bars)
    }
  },
}
</script>
