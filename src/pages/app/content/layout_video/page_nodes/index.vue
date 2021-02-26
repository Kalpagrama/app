<style lang="sass" scoped>
.node
  cursor: pointer
  &:hover
    // background: rgba(50,50,50,0.5)
</style>

<template lang="pug">
page-nodes-root(
  :contentKalpa="contentKalpa"
  :player="player")
  template(v-slot:header)
    .row.full-width.justify-center
      div(
        :style=`{
          maxWidth: 650+'px',
        }`
        ).row.full-width.items-center.content-center.q-py-md.q-px-lg
        span.text-white.text-bold Ядра
        .col
        q-btn(round flat color="white" icon="clear" @click="$emit('close')")
  template(v-slot:item=`{item,isSelected}`)
    div(
      v-if="item.items[0] && item.items[0].layers"
      @click="nodeClick(item)"
      :style=`{
      }`
      ).row.full-width.q-px-md.node.q-mb-md
      .row.full-width
        div(
          :style=`{
            borderRadius: '10px',
            background: 'rgba(35,35,35,0.5)',
          }`
          ).row.full-width
          //- small.text-grey-4 {{ getText(item) }}
          img(
            draggable="false"
            :src="item.items[0].thumbUrl"
            :style=`{
              height: '40px',
              borderRadius: '10px',
            }`)
      .row.full-width.q-px-sm.q-py-xs
        span.text-white {{ item.name }}
</template>

<script>
import pageNodesRoot from '../../page_nodes_root/index.vue'

export default {
  name: 'pageNodes',
  props: ['contentKalpa', 'player'],
  components: {
    pageNodesRoot,
  },
  data () {
    return {
    }
  },
  methods: {
    nodeClick (node) {
      this.$log('nodeClick', node)
      this.player.setCurrentTime(node.items[0].layers[0].figuresAbsolute[0].t)
      this.player.play()
      this.player.setState('nodePlaying', node)
      this.$emit('close')
    }
  }
}
</script>
