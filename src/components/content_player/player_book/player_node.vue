<template lang="pug">
q-dialog(
  v-model="nodeShow"
  :maximized="true"
  :full-width="true"
  @hide="$emit('close')")
  div(
    @click.self="node = null"
    ).row.fit.items-center.content-center.justify-center
    item-feed(
      :isActive="true"
      :isVisible="true"
      :itemShortOrFull="node"
      :style=`{
        maxWidth: 600+'px',
      }`)
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'playerNode',
  props: ['node'],
  data () {
    return {}
  },
  computed: {
    nodeShow () {
      return !!this.node
    }
  },
  mounted () {
    // this.$logE('mounted', this.node)
  }
}
</script>
