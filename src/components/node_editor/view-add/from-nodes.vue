<template lang="pug">
ws-nodes(
  :mode="'pick'"
  :query="{}"
  )
  template(v-slot:tint=`{item}`)
    div(
      @click="nodeClick(item)"
      :style=`{
        position: 'absolute', zIndex: 1000,
      }`
      ).row.fit.cursor-pointer
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'nodeEditor_viewAdd_fromNodes',
  components: {
    wsNodes: () => import('pages/app/ws_nodes/index.vue'),
  },
  data () {
    return {
    }
  },
  methods: {
    async nodeClick (node) {
      this.$log('nodeClick', node)
      // need node by oid
      if (node.wsItemType === 'WS_BOOKMARK') {
        node = await this.$rxdb.get(RxCollectionEnum.OBJ, node.oid)
        this.$log('node', node)
      }
      if (node.items && node.items.length > 0) {
        node.items.map(i => {
          this.$emit('item', i)
        })
      }
    }
  }
}
</script>
