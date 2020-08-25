<template lang="pug">
kalpa-loader(:mangoQuery="nodesQuery" :sliceSize="1000" @items="nodesLoaded")
  template(v-slot=`{items, itemsMore}`)
    div(:style=`{position: 'relative', height: pageHeight+'px'}`).column.full-width
      //- scroll wrapper
      .col.full-width.scroll
        .row.full-width.items-start.content-start.justify-center.q-py-sm
          div(
            v-for="(n, ni) in items" :key="n.id"
            ).row.full-width.items-start.content-start.justify-center
            q-checkbox(
              :val="n.id"
              v-model="nodesSelected" flat dense dark color="green"
              :style=`{opacity: nodesSelected.includes(n.id) ? 1 : 0.3}`).q-ma-sm
            //- item wrapper
            .col
              node-item(
                :node="n"
                :contentWorkspace="contentWorkspace" :contentKalpa="contentKalpa" :player="player"
                :isSelected="n.id === nodeSelectedId"
                :isEditing="n.id === nodeEditingId"
                :style=`{
                }`
                @select="nodeSelect(n,ni)"
                @unselect="$emit('nodeUnselected', n.id)"
                @remove="nodeRemove(n,ni)")
            q-btn(round flat dense color="grey-8" icon="more_vert")
      //- nodes selected actions...
      div(
        v-if="nodesSelected.length > 0"
        :style=`{
          position: 'absolute', zIndex: 1000, bottom: '0px',
          borderRadius: '10px 10px', overflow: 'hidden',
        }`
        ).row.full-width.items-center.content-center.q-pa-sm.b-80
        q-btn(flat color="grey-6" no-caps @click="nodesSelected = []") Cancel
        .col
        q-btn(flat color="red" no-caps @click="nodesSelectedDelete()").q-mr-sm Delete selected
        q-btn(color="green" no-caps @click="nodesSelectedCreateNode()") Create node
</template>

<script>
// api
import { RxCollectionEnum } from 'src/system/rxdb'
import { NodeApi } from 'src/api/node'
import nodeItem from './node_item/index.vue'

export default {
  name: 'wsContentExplorer_pageDrafts',
  components: {nodeItem},
  props: ['contentWorkspace', 'contentKalpa', 'player', 'pageHeight', 'nodeSelectedId', 'nodeEditingId'],
  data () {
    return {
      nodesSelected: []
    }
  },
  computed: {
    nodesQuery () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.WS_NODE,
          // contentOid: this.contentKalpa.oid,
          // stage: 'draft', // published? saved?
          contentOids: {$elemMatch: {$eq: this.contentKalpa.oid}},
          stage: 'draft',
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
    nodesSelectedCreateNode () {
      this.$log('nodesSelectedCreateNode', this.nodesSelected)
      // create multinode or combine them under one essence?
    },
    nodesSelectedDelete () {
      this.$log('nodesSelectedDelete', this.nodesSelected)
      if (!confirm(this.$t('confirm_Delete nodes?', 'Удалить ядра?'))) return
      this.nodesSelected.map(id => {
        this.$rxdb.remove(id)
      })
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
