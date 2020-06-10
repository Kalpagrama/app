<template lang="pug">
div(:style=`{position: 'relative'}`).column.fit
  //- node editor
  q-dialog(
    v-model="nodeEditorOpened" full-height position="bottom")
    ws-node-editor(
      @close="nodeEditorOpened = false"
      :node="node"
      :style=`{
        maxWidth: '800px',
        maxHeight: '800px',
        minHeight: '800px',
      }`).full-height
  //- header
  div(v-if="!stateExplorer.layerEditing").row.full-width.items-center.content-center
    //- header: name
    div(v-if="resizable").row.full-width.q-py-md.q-px-sm
      span(:style=`{fontSize: '18px'}`).text-white.text-bold Layers
    //- search layers
    div(
      v-if="layersSelected.length === 0"
      :style=`{height: '60px', paddingLeft: '40px', paddingRight: '40px'}`).row.full-width.items-center.content-center
      q-input(
        v-model="searchString"
        label="Find layer..."
        filled dark dense color="grey-5").full-width
        template(v-slot:append)
          q-btn(
            v-if="searchString.length > 0"
            @click="searchString = ''"
            round flat dense icon="clear" color="grey-5")
    //- tools when selected
    div(
      v-if="layersSelected.length > 0"
      :style=`{height: '60px'}`).row.full-width.items-center.content-center.q-py-sm
      div(:style=`{width: '40px', height: '40px'}`).row.items-center.content-center.justify-center.q-mr-md
        q-btn(round flat dense color="white" icon="clear" @click="layersSelected = []").b-60
      q-btn(round dense color="green" no-caps @click="layersSelectedCreateNode()").q-px-sm.q-mr-md Create node
      //- .col
      q-btn(round flat dense color="red" no-caps @click="layersSelectedDelete()").q-px-sm.b-60 Delete
  //- layer editor
  layer-editor(
    v-if="stateExplorer.layerEditing"
    :stateExplorer="stateExplorer"
    :style=`{
      position: 'absolute', zIndex: 9999,
    }`
    ).full-height.b-50
  //- body
  .col.full-width.scroll
    div(:style=`{paddingBottom: '200px'}`).row.full-width.items-start.content-start
      draggable(
        :list="layers" group="layers" handle=".layer-drag-handle"
        :sort="true"
        @start="layersDragging = true"
        @end="layersDragging = false").full-width
        div(
          v-for="(l,li) in layersFiltered" :key="l.id"
          :style=`{
            minHeight: '40px',
          }`
          ).row.full-width.items-start.content-start.q-mb-xs
          //- left select
          div(
            :style=`{width: '40px'}`
           ).row.full-height.items-start.content-start.justify-center.q-pa-sm
            q-checkbox(
              v-model="layersSelected" :val="l.id" dark dense color="grey-6"
              :style=`{opacity: layersSelected.includes(l.id) ? 1 : 0.6}`)
          //- middle layer
          .col.full-height
            layer-item(
              :stateExplorer="stateExplorer" :layer="l" :layerIndex="l"
              :style=`{}`)
          //- right drag
          div(
            ).row.full-height.items-start.content-start.layer-drag-handle
            q-btn(
              round flat dense color="grey-6" icon="drag_indicator"
              :style=`{height: '40px', width: '40px'}`)
              kalpa-menu-popup(:actions="actions")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import draggable from 'vuedraggable'
import layerItem from './layer_item'
import layerEditor from '../../layer_editor'

export default {
  name: 'metaLayers',
  components: {draggable, layerItem, layerEditor},
  props: ['stateExplorer', 'resizable'],
  data () {
    return {
      searchString: '',
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
    },
    layersFiltered () {
      return this.layers.filter((l, li) => {
        if (l.spheres.length > 0) {
          if (this.searchString.length > 0) {
            let nameRegExp = new RegExp(this.searchString, 'i')
            return nameRegExp.test(l.spheres[0].name)
          }
          else return true
        }
        return true
      })
    },
    actions () {
      return {
        edit: {
          name: 'Edit',
          fn: () => {
            this.$log('Edit')
          }
        },
        createNode: {
          name: 'Create node',
          fn: () => {
            this.$log('Create node')
          }
        },
        copy: {
          name: 'Copy',
          fn: () => {
            this.$log('Copy')
          }
        },
        delete: {
          name: 'Delete',
          fn: () => {
            this.$log('Delete')
          }
        }
      }
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
      // TODO: itemLayers or itemItems ???
      // show action dialog here
      let itemLayers = this.layers.filter(layer => this.layersSelected.includes(layer.id))
      let itemName = ''
      let itemInput = {
        id: itemId,
        name: itemName,
        layers: itemLayers,
        spheres: [],
        contentType: 'VIDEO',
        contentOid: this.stateExplorer.content.oid,
        thumbUrl: this.stateExplorer.content.thumbUrl,
        operation: {items: null, operations: null, type: 'CONCAT'}
      }
      this.$set(this.node.items, itemIndex, itemInput)
      this.layersSelected = []
      this.nodeEditorOpened = true
    }
  }
}
</script>
