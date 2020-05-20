<template lang="pug">
div(:style=`{position: 'relative'}`).column.fit
  q-resize-observer(@resize="onResize")
  //- actions
  q-btn(
    round push color="green" icon="add" size="lg" @click="layerAdd()"
    :style=`{
      position: 'absolute', zIndex: 1000, top: '-80px', right: '18px',
      borderRadius: '50%'
    }`
  )
  //- layersWorkspace
  q-dialog(v-model="layersWorkspaceShow")
    div(:style=`{position: 'relative', borderRadius: '10px', overflow: 'hidden'}`).column.fit.b-50
      div(:style=`{height: '60px'}`
        ).row.full-width.items-center.content-center.q-px-sm
        q-btn(round flat color="white" icon="keyboard_arrow_left" @click="layersWorkspaceShow = false")
        span.text-white.text-bold Layers from workspace
      .col.full-width.scroll
        .row.full-width.items-start.content-start.q-pa-sm
          div(
            v-for="(l,li) in composition.layersWorkspace" :key="l.oid"
            :style=`{height: '44px', borderRadius: '10px'}`
            ).row.full-width.items-center.content-center.q-px-md.b-70.q-mb-xs
            span.text-white {{ l.spheres }}
  //- header
  div(:style=`{borderRadius: '10px'}`
    ).row.full-width.items-center.content-center.q-pa-sm.b-100
    //- q-btn(round flat color="white" icon="keyboard_arrow_up").q-mr-sm.b-110
    //- q-btn(round flat color="white" icon="search").q-mr-sm.b-110
    q-btn(
      round flat icon="line_style" @click="layersView = 'line'"
      :color="layersView === 'line' ? 'green' : 'white'").q-mr-sm.b-110
    q-btn(
      round flat icon="reorder" @click="layersView = 'normal'"
      :color="layersView === 'normal' ? 'green' : 'white'").q-mr-sm.b-110
    q-btn(
      round flat icon="school" @click="layersWorkspaceShow = !layersWorkspaceShow"
      :color="layersWorkspaceShow ? 'green' : 'white'").q-mr-sm.b-110
    .col
    q-btn(round flat color="white" icon="sort" @click="layersSort()").b-110.q-mr-sm
    q-btn(
      round flat icon="edit" @click="layersEdit()"
      :color="layersEditing ? 'green' : 'white'").b-110
  //- body
  .col.full-width.scroll.q-py-sm
    .row.full-width.items-start.content-start.q-pa-sm
      div(:style=`{borderRadius: '10px', overflow: 'hidden'}`).row.full-width.items-start.content-start
        draggable(
          :list="meta.layers" group="layers" handle=".layer-drag-handle"
          :move="itemsDraggingMove"
          @start="layersDragging = true"
          @end="layersDragging = false, layersDraggingFutureIndex = null").full-width
          div(
            v-for="(l,li) in meta.layers" :key="l.oid"
            :style=`{marginBottom: layersView === 'line' ? '0px' : '4px'}`
            ).row.full-width
            //- LEFT
            div(
              v-if="layersEditing"
              v-show="layersView !== 'line'"
              :style=`{width: layersEditingToolsWidth+'px', overflow: 'hidden'}`).row.justify-start.items-start.content-start
              q-checkbox(v-model="layersSelected" :val="l.oid" dark color="grey-6")
            //- CENTER
            .col.full-height
              layer-item(
                :layer="l" :layerIndex="li"
                :layerIsFirst="li === 0" :layerIsLast="li === meta.layers.length-1"
                :layersView="layersView"
                :player="player" :meta="meta"
                :width="width"
                @meta="$emit('meta', $event)")
            //- RIGHT
            div(
              v-if="layersEditing"
              v-show="layersView !== 'line'"
              :style=`{width: layersEditingToolsWidth+'px', overflow: 'hidden'}`).row.justify-end.items-start.content-start
              q-btn(flat round icon="drag_indicator" color="white").layer-drag-handle
                q-menu(auto-close anchor="top left" self="top right")
                  layer-menu()
  //- footer: layersSelected
  div(:style=`{overflow: 'hidden'}`).row.full-width
    transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
      div(
        v-if="layersSelected.length > 0"
        :style=`{borderRadius: '10px'}`).row.full-width.q-pa-sm.b-80
        q-btn(flat color="white" no-caps).q-mr-sm.b-90 {{layersSelected.length}}
        q-btn(flat no-caps color="white" @click="layersSelectedDrop()").q-mr-sm.b-90 Drop
        q-btn(flat no-caps color="white" @click="layersSelectedDelete()").q-mr-sm.b-90 Delete
        q-btn(flat no-caps color="white" @click="layersSelectedCreateNode()").q-mr-sm.b-90 Create node
</template>

<script>
import layerMenu from './layer_menu'
import layerItem from './layer_item'
import draggable from 'vuedraggable'

export default {
  name: 'extraLayersNew',
  components: {layerItem, layerMenu, draggable},
  props: ['player', 'meta', 'composition'],
  data () {
    return {
      width: 0,
      layersEditing: false,
      layersEditingToolsWidth: 0,
      layersSelected: [],
      layersDragging: false,
      layersDraggingFutureIndex: null,
      layersWorkspaceShow: false,
      layersView: 'line',
      layersViews: ['line', 'normal']
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
      this.layersEditing = !this.layersEditing
    },
    layersDraggingMove (e, evt) {
      this.$log('layersDraggingMove', e.draggedContext.futureIndex)
      this.$set(this, 'layersDraggingFutureIndex', e.draggedContext.futureIndex + 1)
    },
    layersSelectedDrop () {
      this.$log('layersSelectedDrop')
      this.$set(this, 'layersSelected', [])
    },
    layersSelectedDelete () {
      this.$log('layersSelectedDelete')
      if (!confirm('Delete selected layers?')) return
      // delete layers
      this.layersSelected.map(oid => {
        let i = this.meta.layers.findIndex(l => l.oid === oid)
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
    },
    layerCopy (l, li) {
      this.$log('layerCopy', l, li)
    },
    layerDelete (l, li) {
      this.$log('layerDelete', l, li)
    },
    async layerAdd (startInput, endInput, layerInput) {
      this.$log('layerAdd start')
      this.$log('layerAdd inputs: ', startInput, endInput, layerInput)
      let start = startInput || this.meta.now
      let end = endInput || start + 10 < this.meta.duration ? start + 10 : this.meta.duration
      this.$log('layerAdd start/end: ', start, end)
      // get index
      let index = this.meta.layers.length
      this.$log('layerIndex index:', index)
      // get layer
      let lId = Date.now().toString()
      let l = layerInput || {
        oid: lId,
        color: this.$randomColor(lId),
        contentOid: this.meta.content.oid,
        figuresAbsolute: [
          {t: start, points: []},
          {t: end, points: []}
        ],
        figuresRelative: [],
        spheres: []
      }
      // set layer
      this.$set(this.composition.layers, index, l)
      // set meta
      this.$emit('meta', ['mode', 'layer'])
      this.$emit('meta', ['layerIndexPlay', index])
      this.$emit('meta', ['layerIndex', -1])
      this.$emit('meta', ['layerIndex', index])
      // scroll to layer?
      this.$log('layerAdd done')
    },
    onResize (e) {
      this.$log('onResize', e)
      this.width = e.width
    }
  }
}
</script>
