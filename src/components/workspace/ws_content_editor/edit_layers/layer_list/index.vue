<style lang="sass" scoped>
.layer
  cursor: pointer
  &:hover
    background: rgb(90,90,90)
</style>

<template lang="pug">
div(:style=`{position: 'relative'}`).row.fit.b-40
  //- footer: layersSelected
  //- transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
  //-   div(
  //-     v-if="layersSelected.length > 0"
  //-     :style=`{
  //-       position: 'absolute', zIndex: 2000, bottom: '60px',
  //-       borderRadius: '10px', overflow: 'hidden',
  //-     }`).row.full-width.q-pa-sm.b-80
  //-     q-btn(flat color="white" icon="clear" @click="layersSelectedDrop()"
  //-       :style=`{width: '40px'}`).q-mr-sm.b-90
  //-     q-btn(flat no-caps color="red" @click="layersSelectedDelete()").q-mr-sm.b-90 Delete
  //-     q-btn(flat no-caps color="white" @click="layersSelectedCreateNode()").q-mr-sm.b-90 Create node
  div(:style=`{position: 'relative'}`).column.fit
    //- header
    div(:style=`{borderRadius: '0 0 10px 10px'}`).row.full-width.q-pa-sm.b-50
      //- q-btn(round flat color="white")
      q-input(
        v-model="searchString"
        label="Find layer..."
        filled dark dense color="grey-6").full-width
    //- body
    div(
      ref="extraLayersScrollArea"
      :style=`{
        position: 'relative',
        overflowX: 'hidden',
      }`
      ).col.full-width.scroll
      div(:style=`{paddingBottom: '200px'}`).row.full-width.items-start.content-start.q-pa-sm
        div(:style=`{borderRadius: '10px', overflow: 'hidden'}`).row.full-width.items-start.content-start
          draggable(
            :list="meta.layers" group="layers" handle=".layer-drag-handle"
            :move="layersDraggingMove" @onChange="layersDraggingUpdate" :sort="true"
            @start="layersDragging = true"
            @end="layersDragging = false, layersDraggingFutureIndex = null").full-width
            div(
              v-for="(l,li) in meta.layers" :key="l.id"
              :style=`{}`
              ).row.full-width.q-mb-xs
              //- LEFT
              div(
                v-if="true"
                :style=`{width: layersEditingToolsWidth+'px', overflow: 'hidden'}`).row.justify-start.items-start.content-start
                q-checkbox(v-model="layersSelected" :val="l.id" dark color="grey-6")
              //- CENTER
              .col.full-height
                div(
                  @click="$emit('layerId', l.id)"
                  :style=`{
                    height: '40px',
                    borderRadius: '10px',
                    overflow: 'hidden',
                  }`
                  ).row.full-width.items-center.content-center.b-70.q-px-md.layer
                  span(
                    v-if="l.spheres.length > 0"
                    :style=`{userSelect: 'none'}`
                    ).text-white {{ l.spheres[0].name }}
              //- RIGHT
              div(
                v-if="true"
                :style=`{width: layersEditingToolsWidth+'px', overflow: 'hidden'}`).row.justify-end.items-start.content-start
                q-btn(flat round icon="drag_indicator" color="white").layer-drag-handle
                  q-menu(auto-close anchor="top left" self="top right")
                    layer-menu(
                      @edit="layerEdit(l, li)"
                      @copy="layerCopy(l, li)"
                      @delete="layerDelete(l, li)")
</template>

<script>
import draggable from 'vuedraggable'

export default {
  name: 'layerList',
  components: {draggable},
  props: ['editorType', 'player', 'meta', 'composition'],
  data () {
    return {
      layersEditing: false,
      layersEditingToolsWidth: 40,
      layersSelected: [],
      layersDragging: false,
      layersDraggingFutureIndex: null,
    }
  },
  watch: {},
  methods: {},
}
</script>
