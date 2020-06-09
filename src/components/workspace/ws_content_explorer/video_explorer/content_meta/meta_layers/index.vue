<template lang="pug">
.column.fit
  //- node editor
  q-dialog(
    v-model="nodeEditorOpened" full-height position="left")
    ws-node-editor(
      @close="nodeEditorOpened = false"
      :node="node"
      :style=`{
        maxWidth: '600px',
      }`).full-height
  //- header
  .row.full-width.items-center.content-center.q-px-sm
    .row.full-width.q-py-md.q-px-sm
      span(:style=`{fontSize: '18px'}`).text-white.text-bold Layers {{$store.state.ui.panelMaxWidth}}
    .row.full-width
      q-input(
        v-model="searchString"
        label="Find layer..."
        filled dark dense color="grey-5").full-width
        template(v-slot:append)
          q-btn(
            v-if="searchString.length > 0"
            @click="searchString = ''"
            round flat dense icon="clear" color="grey-5")
    //- tools
    div(
      v-if="layersSelected.length === 0"
      :style=`{position: 'relative'}`).row.full-width.items-center.content-center.q-py-xs
      q-btn(
        @click="layersEditing = !layersEditing"
        round flat dense color="white" icon="edit")
      .col
      q-btn(
        round flat dense color="white" icon="sort"
        )
      //- tools selected
    div(
      v-if="layersSelected.length > 0"
      :style=`{position: 'relative'}`).row.full-width.items-center.content-center.q-py-xs
      q-btn(round flat dense color="white" icon="clear" @click="layersSelected = []").b-60.q-mr-sm
      q-btn(round dense color="green" no-caps @click="layersSelectedCreateNode()").q-px-sm Create node
      .col
      q-btn(round flat dense color="red" no-caps @click="layersSelectedDelete()").q-px-sm.b-60 Delete
  //- body
  .col.full-width.scroll
    div(:style=`{paddingBottom: '200px'}`).row.full-width.items-start.content-start.q-pa-sm
      draggable(
        :list="layers" group="layers" handle=".layer-drag-handle"
        :sort="true"
        @start="layersDragging = true"
        @end="layersDragging = false").full-width
        div(
          v-for="(l,li) in layers" :key="l.id"
          :class=`{
            'q-my-xs': stateExplorer.layerSelected !== l.id,
            'q-my-md': stateExplorer.layerSelected === l.id,
          }`
          :style=`{
            minHeight: '60px',
          }`
          ).row.full-width.items-start.content-start
          //- left select
          div(
            v-show="layersEditing"
           ).row.full-height.items-start.content-start.q-pa-xs
            q-checkbox(v-model="layersSelected" :val="l.id" dark dense color="grey-6")
          //- middle layer
          .col.full-height
            layer-item(
              :stateExplorer="stateExplorer" :layer="l" :layerIndex="l"
              :style=`{}`)
          //- right drag
          div(
            v-show="layersEditing"
            ).row.full-height.items-start.content-start.layer-drag-handle
            q-btn(round flat dense color="grey-6" icon="drag_indicator")
      //- add layer
      div(
        v-if="false"
        :style={
          height: '60px',
          borderRadius: '10px',
          overflow: 'hidden',
        }
        ).row.full-width.b-70
        q-btn(
          @click="stateExplorer.set('layerEditorOpened', true)"
          flat color="green" icon="add").fit
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import draggable from 'vuedraggable'
import layerItem from './layer_item'

export default {
  name: 'metaLayers',
  components: {draggable, layerItem},
  props: ['stateExplorer'],
  data () {
    return {
      searchString: '',
      layersEditing: false,
      layersSelected: [],
      layersDragging: false,
      nodeEditorOpened: false,
      node: null,
      nodeNew: {
        name: '',
        items: [],
        spheres: [],
        category: 'FUN'
      }
    }
  },
  computed: {
    layers () {
      return this.stateExplorer.contentWs?.layers
    }
  },
  methods: {
    layersSelectedDelete () {
      this.$log('layersSelectedDelete')
      if (!confirm('Delete selectd layers ?')) return
      this.layersSelected.map(id => {
        let i = this.layers.findIndex(layer => layer.id === id)
        this.$delete(this.layers, i)
      })
      this.layersSelected = []
      this.layersEditing = false
    },
    async nodeAdd () {
      this.$log('nodeAdd start')
      let nodeInput = {
        name: '',
        wsItemType: 'WS_NODE',
        items: [],
        spheres: [],
        category: 'FUN',
        layout: 'PIP',
        stage: 'draft'
      }
      let node = await this.$rxdb.set(RxCollectionEnum.WS_NODE, nodeInput)
      this.$log('nodeAdd done', node)
      return node
    },
    async layersSelectedCreateNode () {
      this.$log('layersSelectedCreateNode')
      this.node = await this.nodeAdd()
      let itemIndex = this.node.items.length
      let itemId = Date.now().toString()
      let itemLayers = this.layers.filter(layer => this.layersSelected.includes(layer.id))
      let itemName = ''
      let itemInput = {
        id: itemId,
        name: itemName,
        layers: itemLayers,
        spheres: [],
        contentType: 'VIDEO',
        contentOid: '', // content.contentOid,
        thumbUrl: '', // content.thumbOid,
        operation: {items: null, operations: null, type: 'CONCAT'}
      }
      this.$set(this.node.items, itemIndex, itemInput)
      this.layersEditing = false
      this.layersSelected = []
      this.nodeEditorOpened = true
    },
    layerClick (l, li) {
      this.$log('layerClick', l, li)
      let layerStart = l.figuresAbsolute[0].t
      this.$log('layerStart', layerStart)
      this.stateExplorer.player.setCurrentTime(layerStart)
      this.stateExplorer.set('currentTime', layerStart)
    }
  }
}
</script>
