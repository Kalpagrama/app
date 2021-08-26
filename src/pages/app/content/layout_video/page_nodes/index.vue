<style lang="sass" scoped>
.node
  cursor: pointer
  //&:hover
    background: rgba(50,50,50,0.5)
</style>

<template lang="pug">
page-nodes-root(
  :contentKalpa="contentKalpa"
  :player="player")
  template(v-slot:item=`{item: node}`)
    div(
      v-if="node.items[0] && node.items[0].layers"
      @click="nodeClick(node)"
      :style=`{
      }`
      ).row.full-width.node.q-mb-sm.q-px-sm
      div(
        :style=`{
          background: 'rgba(35,35,35,0.4)',
          borderRadius: '10px',
        }`
        ).row.full-width
        div(
          :style=`{
            background: 'rgba(40,40,40,0.4)',
            borderRadius: '10px',
          }`
          ).row.full-width.items-start.content-start
          img(
            draggable="false"
            :src="node.items[0].thumbUrl"
            :style=`{
              height: '50px',
              borderRadius: '10px',
            }`)
          .col
            .row.full-width.q-pa-sm
              span.text-white {{ node.name }}
              div(
                v-if="node.items[0] && node.items[0].layers"
                ).row.full-width
                small.text-grey-8 {{ $time(node.items[0].layers[0].figuresAbsolute[0].t) }}
        //- selected
        div(
          v-if="nodeSelectedOid === node.oid"
          ).row.full-width
          q-btn(round flat color="white" icon="refresh" @click="nodeReplay(node)")
          .col
          q-btn(round flat color="white" icon="launch" @click="nodeLaunch(node)")
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
      nodeSelectedOid: null,
    }
  },
  methods: {
    nodeReplay (node) {
      this.$log('nodeReplay')
      this.player.setCurrentTime(node.items[0].layers[0].figuresAbsolute[0].t)
      this.player.play()
    },
    nodeClick (node) {
      this.$log('nodeClick', node)
      // this.player.setState('node', node)
      // this.player.setState('nodeMode', 'pick')
      this.nodeSelectedOid = node.oid
      this.nodeReplay(node)
      // this.nodeLaunch(node)
    },
    nodeLaunch (node) {
      this.$log('nodeLaunch', node)
      // this.player.setState('nodeMode', 'focus')
      this.$emit('node', node)
    }
  }
}
</script>
