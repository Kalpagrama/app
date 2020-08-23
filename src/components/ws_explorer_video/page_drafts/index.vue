<template lang="pug">
kalpa-loader(:mangoQuery="nodesQuery" :sliceSize="1000" @items="nodesLoaded")
  template(v-slot=`{items, itemsMore}`)
    .row.full-width.justify-center
      div(
        :style=`{maxWidth: '600px',}`
        :class=`{'q-px-lg': $q.screen.width < 800}`
        ).row.full-width.items-start.content-start.q-py-sm
        node-item(
          v-for="(n, ni) in items" :key="n.id"
          :node="n"
          :contentWorkspace="contentWorkspace" :contentKalpa="contentKalpa" :player="player"
          :isSelected="n.id === nodeSelectedId"
          @select="nodeSelect(n,ni)"
          @unselect="$emit('nodeUnselected', n.id)"
          @remove="nodeRemove(n,ni)")
</template>

<script>
// api
import { RxCollectionEnum } from 'src/system/rxdb'
import { NodeApi } from 'src/api/node'
import nodeItem from './node_item/index.vue'

export default {
  name: 'wsContentExplorer_pageDrafts',
  components: {nodeItem},
  props: ['contentWorkspace', 'contentKalpa', 'player', 'pageHeight', 'nodeSelectedId'],
  data () {
    return {
    }
  },
  computed: {
    nodesQuery () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.WS_NODE,
          contentOid: this.contentKalpa.oid,
          stage: 'draft', // published? saved?
        },
        sort: [{updatedAt: 'desc'}],
      }
      // // name
      // if (this.searchString.length > 0) {
      //   let nameRegExp = new RegExp(this.searchString, 'i')
      //   res.selector.name = {$regex: nameRegExp}
      // }
      return res
    }
  },
  methods: {
    nodeSelect (node, nodeIndex) {
      this.$log('nodeSelect', node, nodeIndex)
      let t = node.items[0].layers[0].figuresAbsolute[0].t
      this.$emit('nodeSelected', node.id)
      this.player.setCurrentTime(t)
    },
    async nodeRemove (node) {
      if (!confirm(this.$t('delete_node?', 'Удалить ядро?'))) return
      await this.$rxdb.remove(node.id)
    },
    // emit bars to display them on the content bar...
    nodesLoaded (nodes) {
      // this.$log('nodesLoaded')
      let bars = nodes.reduce((acc, val) => {
        let layer = val.items[0].layers[0]
        if (layer.contentOid === this.contentKalpa.oid) {
          acc.push(layer.figuresAbsolute[0].t)
        }
        return acc
      }, [])
      // this.$log('nodeLoaded bars', bars)
      this.$emit('bars', bars)
    }
  }
}
</script>
