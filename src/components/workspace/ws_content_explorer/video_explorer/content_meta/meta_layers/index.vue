<template lang="pug">
.column.fit
  //- node editor
  q-dialog(
    v-model="nodeEditorOpened" position="left")
    ws-node-editor(
      @close="nodeEditorOpened = false"
      :node="node"
      :style=`{}`)
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
    .row.full-width.items-center.content-center.q-pt-xs.br
      q-btn(
        @click="layersEditing = !layersEditing"
        round flat dense color="white" icon="edit")
      //- small.text-white {{layersSelected}}
  //- body
  .col.full-width.scroll
    .row.full-width.items-start.content-start.q-pa-sm
      draggable(
        :list="layers" group="layers" handle=".layer-drag-handle"
        :sort="true"
        @start="layersDragging = true"
        @end="layersDragging = false").full-width
        div(
          v-for="(l,li) in layers" :key="l.id"
          :style=`{minHeight: '60px',}`
          ).row.full-width.items-start.content-start.q-mb-xs
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
      }
    }
  },
  computed: {
    layers () {
      return this.stateExplorer.contentWs?.layers
    }
  },
  methods: {
    layerClick (l, li) {
      this.$log('layerClick', l, li)
      let layerStart = l.figuresAbsolute[0].t
      this.$log('layerStart', layerStart)
      this.stateExplorer.player.setCurrentTime(layerStart)
      this.stateExplorer.set('currentTime', layerStart)
      // this.node = JSON.parse(JSON.stringify(this.nodeNew))
      // this.nodeEditorOpened = true
    }
  }
}
</script>
