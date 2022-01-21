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
  template(v-slot:header)
    .row.full-width.items-center.content-center.q-px-md
      span.text-white.text-bold {{$t('Смысловые ядра')}}
      .col
      q-btn(round flat color="white" icon="clear" @click="$emit('close')")
  template(v-slot:item=`{item: node}`)
    div(v-if="node.items[0] && node.items[0].layers" @click="nodeClick(node)").row.full-width.node.q-mb-sm
        div(:style=`{border: nodeSelectedOid === node.oid ? '2px solid'+$getPaletteColor('green-8'):null}`).row.full-width.items-center.content-center.br-10.b-35
          img(
            draggable="false"
            :src="node.items[0].thumbUrl"
            :style=`{ height: '50px'}`).br-10
          .col
            .row.full-width.q-px-sm
              span.text-white {{ node.name }}
              div(
                v-if="node.items[0] && node.items[0].layers"
                ).row.full-width
                small.text-grey-8 {{ $time(node.items[0].layers[0].figuresAbsolute[0].t) }}
          q-btn(v-if="nodeSelectedOid === node.oid" round flat color="white" icon="launch" @click="nodeLaunch(node)")

</template>

<script>
import pageNodesRoot from 'src/components/kalpa_item/item_extended/content_extended/page_nodes'

export default {
  name: 'pageNodes',
  props: ['contentKalpa', 'player'],
  components: {
    pageNodesRoot,
  },
  computed: {
    nodeSelectedOid () {
      return this?.player?.nodeMode === 'focus' ? this?.player?.node?.oid : null
    }
  },
  methods: {
    nodeClick (node) {
      this.$log('nodeClick', node)
      this.player.setState('node', node)
      this.player.setState('nodeMode', 'focus')
    },
    async nodeLaunch (node) {
      this.$log('nodeLaunch', node)
      await this.$router.push('/node/' + node.oid)
    }
  },
  watch: {
    //
  }
}
</script>
