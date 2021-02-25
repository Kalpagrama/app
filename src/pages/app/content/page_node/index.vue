<template lang="pug">
div(
  :style=`{
    position: 'relative',
  }`
  ).row.full-width
  .row.full-width.q-pa-sm
    node-feed(
      v-if="node"
      :node="node"
      :isActive="true"
      :isVisible="true"
      :orderName="3"
      :orderSpheres="4"
      :orderHeader="5"
      :orderActions="6")
      template(v-slot:items)
        .row.full-width
          div(
            v-if="node.items.length === 2"
            :style=`{
              height: height-200-'px',
            }`).row.full-width
            node-items-item(
              :item="node.items[itemContentIndex === 0 ? 1 : 0]"
              :itemActive="true"
              :itemIndex="itemContentIndex === 0 ? 1 : 0"
              :itemOpened="false"
              :styles=`{
                height: height-200+'px',
                objectFit: 'cover',
              }`)
  //- footer sticky
  div(
    :style=`{
      position: 'fixed', zIndex: 1000, left: '0px',
      bottom: '0px',
    }`
    ).row.full-width.justify-center
    div(
      :style=`{
        maxWidth: $store.state.ui.pageWidth+'px',
        height: '70px',
        borderRadius: '10px 10px 0 0',
      }`).row.full-width.items-center.content-center.q-px-sm
      q-btn(
        @click="$emit('nodeCancel')"
        flat color="grey-7" icon="west" no-caps
        :style=`{maxWidth: '60px'}`)
        .row.full-width.justify-center
          small Назад
</template>

<script>
export default {
  name: 'pageNode',
  props: ['contentKalpa', 'player', 'node', 'height'],
  components: {
    nodeItemsItem: () => import('components/node_feed/node_items_item.vue'),
  },
  computed: {
    nodeLocal () {
      if (this.node.items.length === 1) {
        return this.node
      }
      else {
        let node = JSON.parse(JSON.stringify(this.node))
        // return item
        // node.items = node.items.filter(i => {
        //   return !(i.items && i.items[0].layers[0].contentOid === this.contentKalpa.oid)
        // })
        return node
      }
    },
    itemContentIndex () {
      if (this.node.items.length === 1) {
        return 0
      }
      else {
        return this.node.items.findIndex(i => {
          return (i.items && i.items[0].layers[0].contentOid === this.contentKalpa.oid)
        })
      }
    }
  },
  mounted () {
    this.$log('mounted')
    let item = this.node.items[this.itemContentIndex]
    let composition = item.type === 'COMPOSITION' ? item : item.items[0]
    if (composition.outputType === 'VIDEO') {
      // set figures
      let figures = composition.layers[0].figuresAbsolute
      this.player.setState('figures', [figures])
      // watch currentTime
      this.$watch('player.currentTime', (to, from) => {
        let start = composition.layers[0].figuresAbsolute[0].t
        let end = composition.layers[0].figuresAbsolute[1].t
        if (to < start || to >= end) {
          this.$log('PLAY AGAIN', start)
          this.player.setCurrentTime(start)
          this.player.play()
        }
      }, {deep: true, immediate: true})
    }
    // watch currentTime if itemContentIndex .type === VIDEO output type ?
    // if image ?
    // if book ?
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    // TODO: unwatch...
    this.player.setState('figures', [])
  }
}
</script>
