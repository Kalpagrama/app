<template lang="pug">
div(:style=`{position: 'relative'}`).column.fit
  kalpa-debug(:options=`state`)
  //- layer editor
  transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
    layer-editor(
      v-if="stateEditor.layerEditorOpened"
      v-bind="$props"
      @close="stateEditor.set('layerEditorOpened', false)"
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

export default {
  name: 'editLayers',
  components: {layerList, layerEditor},
  props: ['player', 'statePlayer', 'stateEditor'],
  data () {
    return {
    }
  },
  computed: {
    layerActions () {
      let res = {
        edit: {
          name: 'Edit',
          fn: (layer) => {
            this.$log('Edit', layer)
            this.layerEdit(layer)
          }
        },
        copy: {
          name: 'Copy',
          fn: (layer) => {
            this.$log('Copy', layer)
            this.layerAdd(layer)
          }
        },
        createNode: {
          name: 'Create node',
          fn: () => {
            this.$log('create node')
          }
        },
        delete: {
          name: 'Delete',
          fn: (layer) => {
            this.$log('Delete', layer)
            // if (!confirm('Delete layer ?!')) return
          }
        }
      }
      return res
    }
  },
  watch: {
  },
  methods: {
    // layers
    layersSelectedCreateNode (arr) {
      this.$log('layersSelectedCreateNode', arr)
    },
    layersSelectedDelete (arr) {
      this.$log('layersSelectedDelete', arr)
    },
    // layer
    layerForward (isNext) {
      this.$log('layerForward', isNext)
    },
    layerPick (layer) {
      this.$log('layerPick', layer)
      this.statePlayer.set('layerId', layer.id)
      this.statePlayer.set('mode', 'layer')
      this.stateEditor.set('layerEditorOpened', true)
    },
    layerCopy (layer) {
      this.$log('layerCopy', layer)
    },
    layerDelete (l, li) {
      this.$log('layerDelete', l, li)
      let i = this.statePlayer.layers.findIndex(layer => layer.id === l.id)
      if (i >= 0) {
        if (!confirm('Delete layer ?!')) return
        this.$delete(this.statePlayer.layers, i)
      }
    },
    async layerAdd (layerInput, layerPick = true) {
      this.$log('layerAdd start', layerInput)
      if (!layerInput) {
        let start = this.statePlayer.now
        let end = start + 10 > this.statePlayer.duration ? this.statePlayer.duration : start + 10
        layerInput = {
          contentOid: this.statePlayer.content.oid,
          figuresAbsolute: [
            {t: start, points: []},
            {t: end, points: []}
          ],
          figuresRelative: [],
          spheres: []
        }
      }
      // make layer input
      let layerIndex = this.statePlayer.layers.length
      let layerId = Date.now().toString()
      layerInput.id = layerId
      layerInput.color = this.$randomColor(layerId)
      this.$log('layerAdd layerInput', layerInput)
      // set layer
      this.$set(this.statePlayer.composition.layers, layerIndex, layerInput)
      if (layerPick) {
        this.statePlayer.set('layerId', layerId)
        this.statePlayer.set('mode', 'layer')
        this.stateEditor.set('layerEditorOpened', true)
      }
      this.$log('layerAdd done')
    }
  }
}
</script>
