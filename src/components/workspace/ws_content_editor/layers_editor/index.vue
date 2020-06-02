<template lang="pug">
div(:style=`{position: 'relative'}`).column.fit
  //- layer editor
  transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
    layer-editor(
      v-if="layerEditing"
      v-bind="$props"
      @close="layerEditing = null"
      @prev="layerForward(false)"
      @next="layerForward(true)"
      :style=`{
        position: 'absolute', zIndex: 2000,
        borderRadius: '10px', overflow: 'hidden'
      }`)
  //- body
  .col.full-width
    layer-list(
      v-bind="$props"
      mode="layers"
      @pick="layerPick"
      :actions=`layerActions`)
      template(v-slot:headerSelected=`{layersSelected}`)
        .row
          q-btn(dense no-caps color="green" @click="layersSelectedCreateNode(layersSelected)").q-px-sm.q-mr-sm Create node
          q-btn(dense no-caps color="green" @click="layersSelectedDelete(layersSelected)").q-px-sm Delete
</template>

<script>
import layerList from '../layer_list'
import layerEditor from './layer_editor'
import compositionController from './composition_controller'

export default {
  name: 'editLayers',
  components: {layerList, layerEditor, compositionController},
  props: ['editorType', 'player', 'meta', 'composition', 'pages', 'pageId'],
  data () {
    return {
      layerEditing: null,
    }
  },
  computed: {
    layerActions () {
      let res = {
        edit: {
          name: 'Edit',
          fn: (layer) => {
            this.$log('Edit', layer)
          }
        },
        copy: {
          name: 'Copy',
          fn: (layer) => {
            this.$log('Copy', layer)
          }
        },
        createNode: {
          name: 'Create node'
        },
        delete: {
          name: 'Delete',
          fn: (layer) => {
            this.$log('Delete', layer)
          }
        }
      }
      return res
    }
  },
  watch: {
  },
  methods: {
    layerForward (isNext) {
      this.$log('layerForward', isNext)
    },
    layerPick (layer) {
      this.$log('layerPick', layer)
      this.layerEditing = layer.id
    },
    layerClicked (id) {
      this.layerEditing = id
      this.player.meta(['mode', 'layer'])
      this.player.meta(['layerId', id])
    },
    layersSort () {
      this.$log('layersSort')
      this.composition.layers.sort((a, b) => {
        if (a.figuresAbsolute[0].t > b.figuresAbsolute[1].t) return 1
        else return -1
      })
    },
    layersEdit () {
      this.$log('layersEdit')
      if (this.layersView === 'line') this.layersView = 'normal'
      this.layersEditing = !this.layersEditing
    },
    layerSelectedDelete (arr) {
      this.$log('layersSelectedDelete', arr)
    },
    // layersDraggingMove (e, evt) {
    //   this.$log('layersDraggingMove', e.draggedContext.futureIndex)
    //   this.$set(this, 'layersDraggingFutureIndex', e.draggedContext.futureIndex + 1)
    // },
    // layersDraggingUpdate (e, evt) {
    //   this.$log('layersDraggingUpdate', e, evt)
    // },
    layerEdit (l, li) {
      this.$log('layerEdit', l, li)
      // ???
    },
    layerCopy (l, li) {
      this.$log('layerCopy', l, li)
      this.layerAdd(l)
    },
    layerDelete (l, li) {
      this.$log('layerDelete', l, li)
      let i = this.meta.layers.findIndex(layer => layer.id === l.id)
      if (i >= 0) {
        if (!confirm('Delete layer ?!')) return
        this.$delete(this.meta.layers, i)
      }
    },
    layerAddFromWorkspace () {
      this.$log('layerAddFromWorkspace')
      this.layersWorkspaceShow = true
    },
    layerFound (l, li) {
      this.$log('layerFound', l, li)
      this.layersWorkspaceShow = false
      this.layerAdd(l)
    },
    layerAddFromContent () {
      this.$log('layerAddFromContent')
    },
    async layerAdd (layerInput, openEditor = true) {
      this.$log('layerAdd start', layerInput)
      if (!layerInput) {
        let start = this.meta.now
        let end = start + 10 > this.meta.duration ? this.meta.duration : start + 10
        layerInput = {
          contentOid: this.meta.content.oid,
          figuresAbsolute: [
            {t: start, points: []},
            {t: end, points: []}
          ],
          figuresRelative: [],
          spheres: []
        }
      }
      let layerIndex = this.meta.layers.length
      let layerId = Date.now().toString()
      layerInput.id = layerId
      layerInput.color = this.$randomColor(layerId)
      this.$log('layerAdd layerInput', layerInput)
      // if (this.composition.layers.findIndex(layer => layer.id === layerId) >= 0) alert('DUPLICATE ID')
      // set layer
      this.$set(this.composition.layers, layerIndex, layerInput)
      // set meta
      this.$nextTick(() => {
        this.player.meta(['layerId', layerId])
        this.player.meta(['mode', 'layer'])
        if (openEditor) this.layerEditing = layerId
      })
      this.$log('layerAdd done')
    }
  }
}
</script>
