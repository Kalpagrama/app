<template lang="pug">
.column.fit
  //- div(:style=`{}`).row.full-width.q-pa-sm
  .col.full-width.scroll
    div(v-if="node.items.length > 0").row.full-width.items-start.content-start
      item-item(
        v-for="(i,ii) in node.items" :key="i.id"
        :item="item" :itemIndex="itemIndex"
        :style=`{}`)
    div(v-else).column.fit
      div().row.full-width.q-px-md.q-pt-md
        span.text-white.text-bold Add first item
      .col.full-width
        ws-content-list(ctx="nodeEditor" @layer="layerFound")
  //- div(:style=`{}`).row.full-width.q-pa-sm
</template>

<script>
import itemItem from './item_item'
export default {
  name: 'editItems',
  components: {itemItem},
  props: ['node'],
  data () {
    return {
    }
  },
  computed: {
  },
  methods: {
    layerFound (layer) {
      this.$log('layerFound', layer)
      let itemIndex = this.node.items.length
      let itemId = Date.now().toString()
      let itemInput = {
        id: itemId,
        layers: [layer],
        spheres: []
      }
      this.$set(this.node.items, itemIndex, itemInput)
    }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
