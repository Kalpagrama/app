<style lang="sass" scoped>
.layer
  cursor: pointer
  &:hover
    background: rgb(90,90,90)
</style>

<template lang="pug">
div(:style=`{position: 'relative'}`).row.fit
  //- footer: layersSelected
  transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
    div(
      v-if="layersSelected.length > 0"
      :style=`{
        position: 'absolute', zIndex: 100, bottom: '-20px', paddingBottom: '28px',
        borderRadius: '10px', overflow: 'hidden',
      }`).row.full-width.q-pt-sm.q-px-sm.b-80
      q-btn(flat color="white" icon="clear" @click="layersSelectedDrop()"
        :style=`{width: '40px'}`).q-mr-sm.b-90
      q-btn(flat no-caps color="white" @click="layersSelectedCreateNode()").q-mr-sm.b-90 Create node
      q-btn(flat no-caps color="white" @click="layersSelectedDelete()").q-mr-sm.b-90 Delete
  div(:style=`{position: 'relative'}`).column.fit
    //- header
    //- div(:style=`{borderRadius: '0 0 10px 10px'}`).row.full-width.q-pa-sm.b-50
    //-   //- q-btn(round flat color="white")
    //-   q-input(
    //-     v-model="searchString"
    //-     label="Find layer..."
    //-     filled dark dense color="grey-6").full-width
    //- body
    div(
      ref="extraLayersScrollArea"
      :style=`{
        position: 'relative',
        overflowX: 'hidden',
      }`
      ).col.full-width.scroll
      div(:style=`{paddingBottom: '200px'}`).row.full-width.items-start.content-start.q-py-sm
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
                :style=`{width: '40px'}`).row.items-center.content-center.justify-center
                q-checkbox(v-model="layersSelected" :val="l.id" dark color="grey-6")
              //- CENTER
              .col
                div(
                  @click="$emit('layerId', l.id)"
                  :class=`{
                    'b-70': l.id !== meta.layerId,
                    'b-100': l.id === meta.layerId
                  }`
                  :style=`{
                    height: '40px',
                    borderRadius: '10px',
                    overflow: 'hidden',
                  }`
                  ).row.full-width.items-center.content-center.q-px-md.layer
                  span(
                    v-if="l.spheres.length > 0"
                    :style=`{userSelect: 'none'}`
                    ).text-white {{ l.spheres[0].name }}
              //- RIGHT
              div(
                :style=`{width: '40px'}`).row.items-center.content-center.justify-center
                q-btn(flat dense round color="white").layer-drag-handle
                  q-icon(name="drag_indicator" size="25px" color="grey-4")
                  q-menu(cover auto-close anchor="top right")
                    div(:style=`{minWidth: '150px', maxWidth: '150px'}`).column.fit.b-70
                      .col.full-width
                        q-btn(
                          v-for="(a,akey) in layerActions" :key="akey"
                          @click="a.fn(l, li)"
                          flat no-caps color="white" align="left"
                          ).full-width {{a.name}}
</template>

<script>
import draggable from 'vuedraggable'

export default {
  name: 'layerList',
  components: {draggable},
  props: ['editorType', 'player', 'meta', 'composition', 'layerAdd'],
  data () {
    return {
      layersEditing: false,
      layersEditingToolsWidth: 36,
      layersSelected: [],
      layersDragging: false,
      layersDraggingFutureIndex: null,
    }
  },
  computed: {
    layerActions () {
      return {
        edit: {
          name: 'Edit',
          fn: (layer, layerIndex) => {
            this.$log('Edit', layer, layerIndex)
          }
        },
        copy: {
          name: 'Copy',
          fn: (layer, layerIndex) => {
            this.$log('copy', layer, layerIndex)
            let layerCopy = JSON.parse(JSON.stringify(layer))
            this.layerAdd(layerCopy, false)
          }
        },
        delete: {
          name: 'Delete',
          fn: (layer, layerIndex) => {
            this.$log('delete', layer, layerIndex)
            if (!confirm('Delete layer?')) return
            if (layerIndex >= 0) this.$delete(this.composition.layers, layerIndex)
          }
        }
      }
    }
  },
  watch: {},
  methods: {
    layersSelectedDrop () {
      this.$log('layersSelectedDrop')
      this.$set(this, 'layersSelected', [])
    },
    layersSelectedDelete () {
      this.$log('layersSelectedDelete')
      if (!confirm('Delete selected layers?')) return
      // delete layers
      this.layersSelected.map(id => {
        let i = this.meta.layers.findIndex(l => l.id === id)
        if (i >= 0) {
          if (this.meta.layerIndexPlay === i) this.$emit('meta', ['layerIndexPlay', -1])
          // TODO: if layerIndex? go to previous?
          this.$delete(this.meta.layers, i)
        }
      })
      // drop layersSelected
      this.$set(this, 'layersSelected', [])
    },
    layersSelectedCreateNode () {
      this.$log('layersSelectedCreateNode')
    },
  },
}
</script>
