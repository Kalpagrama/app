<template lang="pug">
node-feed(
  v-if="node"
  :node="node"
  :isActive="true"
  :isVisible="true"
  :showActions="false")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'typeNode',
  props: ['item'],
  data () {
    return {
      node: null,
    }
  },
  watch: {
    item: {
      immediate: true,
      async handler (to, from) {
        this.$log('item TO', to)
        this.node = await this.$rxdb.get(RxCollectionEnum.OBJ, to.oid)
      }
    }
  }
}
</script>
