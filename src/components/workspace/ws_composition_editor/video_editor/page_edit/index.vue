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
                div(
                  :style=`{width: '40px', height: '40px'}`).row.items-center.content-center.justify-center
                  q-checkbox(
                    v-if="!storeEditor.layerEditing"
                    v-model="layersSelected" :val="l.id"
                    dark dense color="grey-6"
                    :style=`{opacity: layersSelected.includes(l.id) ? 1 : 0.6}`)
                //- middle: input name, layer editor...
                .col.full-height
                  layer-editor(
                    :layer="l")
                //- right: drag
                div(
                  :style=`{width: '40px', height: '40px'}`).row.items-center.content-center.justify-center
                  //- !storeEditor.layerEditing
                  q-btn(
                    v-if="true"
                    round flat dense color="grey-6" icon="drag_indicator").layer-drag-handle
            //- layer ADD
            div(
              v-if="!storeEditor.layerEditing"
              :style=`{}`).row.full-width.justify-center
              div(:style=`{maxWidth: '600px'}`).row.full-width
                q-btn(
                  @click="storeEditor.layerAdd()"
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
  },
  mounted () {
    this.$log('mounted')
  }
}
</script>
