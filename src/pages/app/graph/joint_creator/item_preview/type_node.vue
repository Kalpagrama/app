<template lang="pug">
.row.full-width
  div(
    v-if="!node"
    :style=`{
      minHeight: '200px',
      background: 'rgb(40,40,40)',
      borderRadius: '10px',
    }`
    ).row.full-width.items-center.content-center.justify-center
    q-spinner(size="50px" color="green")
  node-feed(
    v-if="node"
    :node="node"
    :isActive="isActive"
    :isVisible="isActive"
    :showActions="false")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'typeNode',
  props: ['item', 'isActive'],
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
