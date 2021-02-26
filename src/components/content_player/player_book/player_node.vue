<template lang="pug">
q-dialog(
  v-model="nodeShow"
  :maximized="true"
  :full-width="true"
  @hide="$emit('close')")
  div(
    @click.self="nodeShow = false"
    ).row.fit.items-center.content-center.justify-center
    node-feed(
      :isActive="true"
      :isVisible="true"
      :node="node"
      :style=`{
        maxWidth: 600+'px',
      }`)
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'playerNode',
  props: ['oid'],
  data () {
    return {
      node: null,
      nodeShow: false,
    }
  },
  watch: {
    oid: {
      immediate: true,
      async handler (to, from) {
        if (to) {
          this.node = await this.$rxdb.get(RxCollectionEnum.OBJ, to)
          this.nodeShow = true
        }
        else {
          this.nodeShow = false
          this.node = null
        }
      }
    }
  }
}
</script>
