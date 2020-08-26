<template lang="pug">
kalpa-loader(:mangoQuery="nodesQuery" :sliceSize="1000" @items="nodesLoaded")
  template(v-slot=`{items, itemsMore}`)
    //- div(:style=`{
      position: 'relative', height: pageHeight+'px',
      marginTop: '-10px',
      }`).column.full-width
      //- scroll wrapper
      .col.full-width.scroll
    div(:style=`{marginTop: '-10px',}`).row.full-width
      div(
        :class=`{
          'b-40': nodeEditingId,
        }`
        :style=`{
          borderRadius: '0 0 10px 10px', overflow: 'hidden',
          paddingTop: nodeEditingId ? '10px' : '20px',
        }`
        ).row.full-width.items-start.content-start.justify-center
        div(
          v-for="(n, ni) in items" :key="n.id"
          v-if="nodeEditingId ? n.id === nodeEditingId : true"
          ).row.full-width.items-start.content-start.justify-center
          q-checkbox(
            v-if="!nodeEditingId"
            v-model="nodesChecked" :val="n.id"
            flat dense dark color="green"
            :style=`{opacity: nodesChecked.includes(n.id) ? 1 : 0.3}`).q-ma-sm
          //- item wrapper
          div(:style=`{maxWidth: '600px',}`).col
            node-item(
              :node="n"
              :contentWorkspace="contentWorkspace" :contentKalpa="contentKalpa" :player="player"
              :isSelected="n.id === nodeSelectedId"
              :isEditing="n.id === nodeEditingId"
              :style=`{
              }`
              @select="nodeSelect(n,ni)"
              @unselect="nodeSelectedId = null, nodeEditingId = null"
              @edit="nodeEdit(n)"
              @edited="nodeEdited(n)"
              @delete="nodeDelete(n,ni)")
          q-btn(
            v-if="!nodeEditingId"
            round flat dense color="grey-8" icon="more_vert")
        //- isEditing node footer for all the nodes
      div(
        v-if="nodeEditingId"
        ).row.full-width.justify-center
        div(:style=`{maxWidth: '600px',}`).row.full-width.items-center.content-center.q-py-sm
          q-btn(color="grey-4" flat no-caps @click="nodeEditingId = null") Close
          .col
          q-btn(color="green" no-caps @click="nodeEditingId = null") Done
      //- nodes checked actions...
      div(
        v-if="nodesChecked.length > 0"
        :style=`{
          position: 'fixed', zIndex: 1000, bottom: '0px',
          borderRadius: '10px 10px', overflow: 'hidden',
        }`
        ).row.full-width.items-center.content-center.q-pa-sm.b-80
        q-btn(flat color="grey-6" no-caps @click="nodesChecked = []") Cancel
        .col
        q-btn(flat color="red" no-caps @click="nodesCheckedDelete()").q-mr-sm Delete selected
        q-btn(color="green" no-caps @click="nodesCheckedCreateNode()") Create node
</template>

<script>
// api
import { RxCollectionEnum } from 'src/system/rxdb'
import { NodeApi } from 'src/api/node'
import nodeItem from './node_item/index.vue'

export default {
  name: 'wsContentExplorer_pageDrafts',
  components: {nodeItem},
  props: ['contentWorkspace', 'contentKalpa', 'player', 'pageHeight'],
  data () {
    return {
      nodesChecked: [],
      nodeSelectedId: null,
      nodeEditingId: null,
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
    async nodeCreateStart () {
      this.$log('nodeCreateStart')
      let node = await this.nodeCreate()
      this.nodeEditingId = node.id
    },
    async nodeCreate () {
      this.$log('nodeCreate')
      // start/end
      let start = this.player.currentTime
      let end = start + 10 > this.player.duration ? this.player.duration : start + 10
      let nodeInput = {
        name: '',
        spheres: [],
        category: 'FUN',
        layout: 'PIP',
        stage: 'draft',
        wsItemType: 'WS_NODE',
        items: [
          {
            id: Date.now().toString(),
            thumbUrl: this.contentKalpa.thumbUrl,
            outputType: 'VIDEO',
            layers: [
              {id: Date.now().toString(), contentOid: this.contentKalpa.oid, figuresAbsolute: [{t: start, points: []}, {t: end, points: []}]},
            ],
            operation: { items: null, operations: null, type: 'CONCAT'},
          }
        ]
      }
      let node = await this.$rxdb.set(RxCollectionEnum.WS_NODE, nodeInput)
      this.$log('nodeCreate node', node)
      return node
    },
    nodeEdit (node) {
      this.$log('nodeEdit', node)
      this.nodeSelectedId = null
      this.nodeEditingId = node.id
    },
    nodeEdited (node) {
      this.$log('nodeEdited', node)
      this.nodeEditingId = null
      this.nodeSelectedId = node.id
    },
    nodeSelect (node) {
      this.$log('nodeSelect', node)
      let t = node.items[0].layers[0].figuresAbsolute[0].t
      this.player.setCurrentTime(t)
      this.nodeEditingId = null
      this.nodeSelectedId = node.id
    },
    nodesCheckedCreateNode () {
      this.$log('nodesSelectedCreateNode', this.nodesSelected)
      // create multinode or combine them under one essence?
      this.nodesChecked = []
    },
    nodesCheckedDelete () {
      this.$log('nodesCheckedDelete', this.nodesSelected)
      if (!confirm(this.$t('confirm_Delete nodes?', 'Удалить ядра?'))) return
      this.nodesSelected.map(id => {
        this.$rxdb.remove(id)
      })
      this.nodesChecked = []
    },
    async nodeDelete (node) {
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
