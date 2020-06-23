<template lang="pug">
div(:style=`{position: 'relative'}`).column.fit
  //- layers list
  div(v-if="storePlayer").col.full-width
    div(:style=`{}`).column.fit
      //- header
      div(
        v-if="false"
        :style=`{}`).row.full-width.justify-center
        div(:style=`{maxWidth: '600px'}`).row.full-width.items-center.content-center.q-py-xs
          q-btn(round flat dense color="grey-4" icon="search")
          .col
          q-btn(round flat dense color="grey-4" icon="sort")
      //- body
      .col.full-width.scroll
        .row.full-width.justify-center.q-py-sm
          div(:style=`{maxWidth: '680px'}`).row.full-width.justify-center
            draggable(
              :list="composition.layers" group="layers" :sort="true" handle=".layer-drag-handle"
              @start="layersDragging = true"
              @end="layersDragging = false").full-width
              div(
                v-for="(l,li) in composition.layers" :key="li"
                v-show="storeEditor.layerEditing ? storeEditor.layerEditing === l.id : true"
                :style=`{}`
                ).row.full-width.items-start.content-start.q-mb-xs
                //- left: select
                div(:style=`{width: '40px', height: '40px'}`).row.items-center.content-center.justify-center
                  q-checkbox(
                    v-if="!storeEditor.layerEditing"
                    v-model="layersSelected" :val="l.id"
                    dark dense color="grey-6"
                    :style=`{opacity: layersSelected.includes(l.id) ? 1 : 0.6}`)
                //- middle: input name, layer editor...
                .col.full-height
                  layer-editor(:layer="l")
                //- right: drag
                div(:style=`{width: '40px', height: '40px'}`).row.items-center.content-center.justify-center
                  q-btn(
                    v-if="!storeEditor.layerEditing"
                    round flat dense color="grey-6" icon="drag_indicator").layer-drag-handle
                    kalpa-menu-popup(:actions="layerActions" :value="l")
            //- layer ADD
            div(
              v-if="!storeEditor.layerEditing"
              :style=`{}`).row.full-width.justify-center
              div(:style=`{maxWidth: '600px'}`).row.full-width
                q-btn(
                  @click="layerAdd()"
                  flat color="green" icon="add"
                  :style=`{height: '40px'}`
                  ).full-width.b-60
      div(:style=`{height: '50px'}`).row.full-width.bg-red
      div(:style=`{height: '50px'}`).row.full-width.bg-blue
  //- footers for something
  //- div().row.full-width.q-py-sm.bg-red
  //- div().row.full-width.q-py-sm.bg-blue
</template>

<script>
import draggable from 'vuedraggable'
import layerEditor from './layer_editor'

export default {
  name: 'pageEdit',
  components: {draggable, layerEditor},
  props: ['composition'],
  inject: ['sidPlayer', 'sidEditor'],
  data () {
    return {
      layersSelected: [],
      layerDragging: false,
    }
  },
  computed: {
    storeEditor () {
      return window.stores[this.sidEditor]
    },
    storePlayer () {
      return window.stores[this.sidPlayer]
    },
    layerActions () {
      let res = {
        edit: {
          name: 'Edit',
          fn: (layer) => this.layerEdit(layer)
        },
        // copy: {
        //   name: 'Copy',
        //   fn: (layer) => this.layerCopy(layer)
        // },
      }
      if (this.composition.layers.length > 1) {
        res.delete = {
          name: 'Delete',
          fn: (layer) => this.layerDelete(layer)
        }
      }
      return res
    }
  },
  methods: {
    layerEdit (layer) {
      this.$log('layerEdit', layer)
      this.storeEditor.layerPlaying = layer.id
      this.storeEditor.layerEditing = layer.id
    },
    layerDelete (layer) {
      this.$log('layerDelete', layer)
      if (this.composition.layers.length === 1) return
      if (!confirm('Delete layer ?')) return
      let i = this.composition.layers.findIndex(l => l.id === layer.id)
      this.$log('i', i)
      if (i >= 0) this.$delete(this.composition.layers, i)
    },
    layerAdd () {
      this.$log('layerAdd')
      let id = this.storeEditor.layerAdd()
      this.layerEdit({id})
    }
  },
  mounted () {
    this.$log('mounted')
  },
}
</script>
