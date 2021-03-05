<template lang="pug">
div(
  v-if="node"
  ).row.full-width.justify-center
  node-feed(
    :node="node"
    :isActive="false"
    :isVisible="false"
    :showActions="false"
    :style=`{
      maxWidth: $store.state.ui.pageWidth+'px',
    }`)
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageAppJoint',
  data () {
    return {
      node: null,
    }
  },
  watch: {
    '$route.params.oid': {
      deep: true,
      immediate: true,
      async handler (to, from) {
        if (to) {
          // this.$log('$route.params.oid TO', to)
          this.node = await this.$rxdb.get(RxCollectionEnum.OBJ, to)
        }
      }
    },
  },
}
</script>
