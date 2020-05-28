<template lang="pug">
div(:style=`{position: 'relative'}`).column.fit
  q-resize-observer(@resize="onResize")
  //- layer from workspace
  q-dialog(v-model="layersWorkspaceShow" position="bottom")
    ws-content-list(
      ctx="nodeEditor" @layer="layerFound"
      :style=`{
        height: $q.screen.height+'px',
        minHeight: $q.screen.height+'px',
        maxWidth: $store.state.ui.maxWidthPage+'px',
      }`).b-30
      template(v-slot:header)
        div(:style=`{height: '60px', marginBottom: '20px'}`).row.full-width.items-center.content-center.q-px-sm
          q-btn(round flat color="white" icon="keyboard_arrow_left" @click="layersWorkspaceShow = false")
          span.text-white.text-bold Find layer
  //- body
  div(
    ref="extraLayersScrollArea"
    :style=`{
      position: 'relative',
      overflowX: 'hidden',
    }`
    ).col.full-width.scroll
    div(:style=`{}`).row.full-width.items-start.content-start.q-pa-sm
      div(:style=`{borderRadius: '10px', overflow: 'hidden'}`).row.full-width.items-start.content-start
        draggable(
          :list="meta.layers" group="layers" handle=".layer-drag-handle"
          :move="layersDraggingMove" @onChange="layersDraggingUpdate" :sort="true"
          @start="layersDragging = true"
          @end="layersDragging = false, layersDraggingFutureIndex = null").full-width
          div(
            v-for="(l,li) in meta.layers" :key="l.id"
            :ref="`layer-${l.id}`"
            :style=`{marginBottom: layersView === 'line' ? '0px' : '4px'}`
            ).row.full-width
            //- LEFT
            div(
              v-if="true"
              v-show="layersView !== 'line'"
              :style=`{width: layersEditingToolsWidth+'px', overflow: 'hidden'}`).row.justify-start.items-start.content-start
              q-checkbox(v-model="layersSelected" :val="l.id" dark color="grey-6")
            //- CENTER
            .col.full-height
              layer-item(
                :editorType="editorType"
                :layer="l" :layerIndex="li"
                :layerIsFirst="li === 0" :layerIsLast="li === meta.layers.length-1"
                :layersView="layersView"
                :player="player" :meta="meta"
                :width="width"
                @meta="$emit('meta', $event)")
            //- RIGHT
            div(
              v-if="true"
              v-show="layersView !== 'line'"
              :style=`{width: layersEditingToolsWidth+'px', overflow: 'hidden'}`).row.justify-end.items-start.content-start
              q-btn(flat round icon="drag_indicator" color="white").layer-drag-handle
                q-menu(auto-close anchor="top left" self="top right")
                  layer-menu(
                    @edit="layerEdit(l, li)"
                    @copy="layerCopy(l, li)"
                    @delete="layerDelete(l, li)")
  //- footer: import layer from ws
  transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
    q-btn(
      v-if="layersSelected.length === 0" @click="layerAddFromWorkspace()"
      round push color="green" icon="add"
      :style=`{
        position: 'absolute', zIndex: 1900, bottom: '70px', right: '10px',
        borderRadius: '50%',
      }`)
  //- footer: layersSelected
  transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
    div(
      v-if="layersSelected.length > 0"
      :style=`{
        position: 'absolute', zIndex: 2000, bottom: '60px',
        borderRadius: '10px', overflow: 'hidden',
      }`).row.full-width.q-pa-sm.b-80
      q-btn(flat color="white" icon="clear" @click="layersSelectedDrop()"
        :style=`{width: '40px'}`).q-mr-sm.b-90
      q-btn(flat no-caps color="red" @click="layersSelectedDelete()").q-mr-sm.b-90 Delete
      q-btn(flat no-caps color="white" @click="layersSelectedCreateNode()").q-mr-sm.b-90 Create node
  //- footer
  div(
    :style=`{
      borderRadius: $q.screen.gt.xs ? '10px' : '10px 10px 0 0',
    }`
    ).row.full-width.items-end.content-end.q-pa-sm.b-70
    //- q-btn(round flat color="white" icon="keyboard_arrow_up").q-mr-sm.b-110
    //- q-btn(round flat color="white" icon="search").q-mr-sm.b-110
    //- q-btn(
    //-   round flat icon="line_style" @click="layersView = 'line'"
    //-   :color="layersView === 'line' ? 'green' : 'white'").q-mr-sm.b-110
    //- q-btn(
    //-   round flat icon="reorder" @click="layersView = 'normal'"
    //-   :color="layersView === 'normal' ? 'green' : 'white'").q-mr-sm.b-110
    q-btn(
      round icon="edit" @click="layersEdit()"
      :flat="!layersEditing"
      :color="layersEditing ? 'green' : 'white'").b-90
    .col
    q-btn(
      v-if="editorType === 'content'"
      round flat color="white" icon="search").b-90.q-mr-sm
    q-btn(
      v-if="editorType === 'content'"
      round flat color="white" icon="sort" @click="layersSort()").b-90.q-mr-sm
    //- menu toggle
    q-btn(
      round flat color="white" icon="menu_open" @click="$emit('menuToggle')"
      ).b-90
</template>

<script>
import layerMenu from './layer_menu'
import layerItem from './layer_item'
import draggable from 'vuedraggable'

export default {
  name: 'editLayers',
  components: {layerItem, layerMenu, draggable},
  props: ['editorType', 'player', 'meta', 'composition'],
  data () {
    return {
      width: 0,
      layersEditing: false,
      layersEditingToolsWidth: 0,
      layersSelected: [],
      layersDragging: false,
      layersDraggingFutureIndex: null,
      layersWorkspaceShow: false,
      layersView: 'normal',
      layersViews: ['line', 'normal'],
      showRightDrawer: false
    }
  },
  watch: {
    layersEditing: {
      handler (to, from) {
        this.$log('layersEditing CHANGED', to)
        if (to) {
          this.$tween.to(this, 0.5, {layersEditingToolsWidth: 48})
        }
        else {
          this.$tween.to(this, 0.5, {layersEditingToolsWidth: 0})
        }
      }
    },
    'meta.layerIndexPlay': {
      async handler (to, from) {
        // // this.$log('meta.layerIndexPlay CHANGED', to)
        // if (to < 0) return
        // await this.$wait(100)
        // let oid = this.meta.layers[to].oid
        // let ref = this.$refs[`layer-${oid}`][0]
        // let scrollTop = ref.offsetTop - 4
        // this.$tween.to(this.$refs.extraLayersScrollArea, 0.5, {scrollTop: scrollTop})
      }
    }
  },
  methods: {
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
    layersDraggingMove (e, evt) {
      this.$log('layersDraggingMove', e.draggedContext.futureIndex)
      this.$set(this, 'layersDraggingFutureIndex', e.draggedContext.futureIndex + 1)
    },
    layersDraggingUpdate (e, evt) {
      this.$log('layersDraggingUpdate', e, evt)
    },
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
    async layerAdd (layerInput) {
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
      // set layer
      this.$set(this.composition.layers, layerIndex, layerInput)
      // set meta
      // this.$emit('meta', ['mode', 'layer'])
      // this.$emit('meta', ['layerIndex', index])
      // this.$emit('meta', ['layerIndexPlay', index])
      // this.$emit('meta', ['layerIndex', -1])
      this.$log('layerAdd done')
    },
    onResize (e) {
      this.$log('onResize', e)
      this.width = e.width
    }
  }
}
</script>
