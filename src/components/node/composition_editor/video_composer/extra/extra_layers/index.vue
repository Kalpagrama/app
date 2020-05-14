<style lang="sass">
.layer-item
  &:hover
    background: #888 !important
</style>

<template lang="pug">
div(:style=`{}`).column.fit
  //- actions
  //- add
  q-btn(
    v-if="true"
    round push color="green" icon="add" size="lg" @click="layerAdd()"
    :style=`{position: 'absolute', zIndex: 3000, right: '20px', top: '-70px', borderRadius: '50%'}`)
  //- header
  //- transition(appear enter-active-class="animated slideInUp" leave-active-class="animated fadeOut")
  div(
    v-if="height > 100"
    :style=`{height: '70px', borderRadius: '10px', overflow: 'hidden'}`).row.full-width.b-60
    layer-editor-figures(
      v-if="meta.content"
      :player="player" :meta="meta" @meta="$emit('meta', $event)")
  //- body
  div(
    ref="extraNodesScroll"
    :style=`{position: 'relative', overflowX: 'hidden'}`
    ).col.full-width.scroll.b-60
    div(:style=`{marginTop: '0px', marginBottom: '80px'}`).row.full-width.items-start.content-start.q-pt-sm.q-px-xs
      draggable(
        :list="meta.layers" group="layers" handle=".layer-drag-handle"
        :move="layerOnMove"
        @start="layersDragging = true"
        @end="layersDragging = false, layerIndexFuture = null").full-width
        div(
          v-for="(l,li) in meta.layers" :key="l.oid"
          v-if="l.figuresAbsolute.length > 0"
          :style=`{
            position: 'relative'
          }`
          ).row.full-width.q-mb-xs
          //- default layer header
          .row.full-width
            //- layers actions LEFT: select
            div(:style=`{height: '35px', width: '40px'}`).row.items-center.content-center.justify-center
              //- span.text-bold.text-white V
              //- input(type="checkbox").fit
              q-checkbox(v-model="layersSelected" :val="li" dark dense color="grey-6")
            .col
              div(
                :style=`{
                }`
                ).row.fit.cursor-pointer
                div(
                  :class=`{
                    'bg-grey-6': li === meta.layerIndexPlay,
                    'bg-grey-7': li !== meta.layerIndexPlay,
                    'layer-item': li !== meta.layerIndexPlay
                  }`
                  :style=`{position: 'relative', height: '35px', borderRadius: li === meta.layerIndexPlay ? '10px 10px 0 0' : '10px', overflow: 'hidden'}`
                  ).row.full-width.items-center.content-center.q-pr-sm
                  //- layerIndexFuture bar
                  div(
                    v-if="false"
                    :style=`{
                      position: 'absolute', zIndex: 1200, bottom: '-8px', height: '8px'
                    }`
                    ).row.full-width.br
                  //- inactive tint
                  div(v-if="li !== meta.layerIndexPlay" :style=`{position: 'absolute', zIndex: 1000}` @click="layerClick(l, li)").row.fit.cursor-pointer
                  //- now tint
                  div(
                    v-if="li !== meta.layerIndexPlay && meta.now > l.figuresAbsolute[0].t && meta.now < l.figuresAbsolute[1].t"
                    :style=`{
                      position: 'absolute', zIndex: 1100, left: '0px', pointerEvents: 'none',
                      background: 'rgba(255,255,255,0.4)',
                      borderRadius: '10px', overflow: 'hidden',
                      width: ((meta.now-l.figuresAbsolute[0].t)/(l.figuresAbsolute[1].t-l.figuresAbsolute[0].t))*100+'%'
                    }`).row.full-height
                  .col
                    .row.full-height.q-px-md
                      span(
                        @click="layerSetNameStart()"
                        :style=`{
                          userSelect: 'none'
                        }`
                        ).text-white.text-bold.cursor-pointer {{l.spheres.length > 0 ? l.spheres[0].name : li === meta.layerIndexPlay ? 'Set layer name' : ''}}
                        q-popup-proxy(:ref="'les-'+li")
                          layer-editor-spheres(:layer="l" :index="li" :dialog="$refs['les-'+li] ? $refs['les-'+li][0] : null")
                  div(:style=`{userSelect: 'none'}`).row.full-height.items-center.content-center
                    small.text-white {{$time(l.figuresAbsolute[0].t)}}-
                    small.text-white {{$time(l.figuresAbsolute[1].t)}}
                    small.text-white.q-mx-xs /
                    small.text-white {{$time(l.figuresAbsolute[1].t-l.figuresAbsolute[0].t)}}
            div(:style=`{height: '35px', width: '40px'}`).row.items-center.content-center.justify-center
              q-btn(
                round flat dense color="grey-6" icon="drag_indicator"
                :style=`{cursor: layersDragging ? 'grabbing' : 'grab'}`).layer-drag-handle
          layer-active(
            v-if="li === meta.layerIndexPlay"
            v-bind="$props" :layer="l" :index="li"
            @meta="$emit('meta', $event)")
  //- layers FROM WORKSPACE modal
  div(
    v-if="showLayersFromWorkspace"
    :style=`{
      position: 'absolute', zIndex: 400, right: '0px', top: '0px',
      maxWidth: '66%', maxHeight: 'calc(100% - 120px)',
      borderRadius: '10px', overflow: 'hidden',
    }`).column.fit.bg-grey-8
    //- header
    div(:style=`{height: '60px'}`).row.full-width.items-center
      .col
        .row.fit.items-center.content-center.q-px-md
          span.text-white Layers from workspace
      q-btn(round flat dense color="white" icon="more_vert").q-mr-md
    //- body
    .col.full-width.scroll
      .row.full-width.items-start.content-start.q-pa-sm
        div(
          v-for="(l,li) in composition.layersWorkspace" :key="li" @click="layerWorkspaceClick(l,li)"
          :style=`{height: '35px', borderRadius: '10px'}`
          ).row.full-width.items-center.bg-grey-7.cursor-pointer.q-px-md.q-mb-sm
          .col
            .row.fit.items-center.content-center-q-px-md
              span(v-if="l.spheres.length > 0").text-white {{ l.spheres[0].name }}
          span.text-white {{$time(l.figuresAbsolute[0].t)}}-{{$time(l.figuresAbsolute[1].t)}}
  //- layers selected
  div(:style=`{overflow: 'hidden'}`).row.full-width
    transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
      div(
        v-if="layersSelected.length > 0"
        :style=`{borderRadius: '10px 10px 0 0', marginBottom: '-20px', paddingBottom: '20px'}`).row.full-width.q-px-xs.b-70
        //- left: total selected layers number
        div(:style=`{height: '44px', width: '40px'}`).row.items-center.content-center.justify-center
          div(:style=`{height: '18px', minWidth: '18px', borderRadius: '2px'}`).row.items-center.content-center.justify-center.bg-grey-6
            span.text-white {{layersSelected.length}}
        //- actions wrapper: drop, create node, delete
        .col
          .row.fit.items-center.content-center
            q-btn(flat dense no-caps color="white" @click="layersSelectedDrop()").bg-grey-7.q-mr-sm.q-px-sm Drop selection
            q-btn(flat dense no-caps color="white" @click="layersSelectedCreateNode()").bg-grey-7.q-mr-sm.q-px-sm Create node
            q-btn(flat dense no-caps color="white" @click="layersSelectedDelete()").bg-grey-7.q-mr-sm.q-px-sm Delete
        //- right...
  //- footer
  div(
    v-if="true"
    :style=`{borderRadius: '10px 10px 0 0', marginBottom: '-20px', paddingBottom: '30px'}`
    ).row.full-width.items-center.content-center.q-pa-sm.b-80
    //- actions wrapper: play all, watch, workspace
    .col
      //- actions
      q-btn(
        @click="layersPlayAll()"
        flat color="white" no-caps
        ).q-mr-sm.b-100 Play all
      q-btn(
        @click="layersWatch()"
        flat color="white" no-caps
        ).q-mr-sm.b-100 Watch
      q-btn(
        v-if="composition.layersWorkspace"
        @click="showLayersFromWorkspace = !showLayersFromWorkspace"
        round flat icon="school" color="grey-2").b-100
    //- right: total
    q-btn(
      flat no-caps color="white"
      ).b-100 Total: {{$time(layersTotalTime)}}
</template>

<script>
import layerEditorFigures from './layer_editor_figures'
import layerEditorSpheres from './layer_editor_spheres'
import layerActive from './layer_active'
import draggable from 'vuedraggable'

export default {
  name: 'extraLayers',
  components: {layerEditorFigures, layerEditorSpheres, layerActive, draggable},
  props: ['composition', 'player', 'meta', 'height'],
  data () {
    return {
      scrollTweening: false,
      scrollOverflow: 'auto',
      scrollTimeout: null,
      showLayersFromWorkspace: false,
      layerNameEditing: false,
      layerIndexFuture: null,
      layersDragging: false,
      layersSelected: []
    }
  },
  computed: {
    layersTotalTime () {
      return this.meta.layers.reduce((acc, val) => {
        if (val.figuresAbsolute.length > 0) {
          acc += (val.figuresAbsolute[1].t - val.figuresAbsolute[0].t)
        }
        return acc
      }, 0)
    }
  },
  watch: {
  },
  methods: {
    layersSelectedDelete () {
      this.$log('layersSeletedDelete')
      if (!confirm('Delete selected layers?')) return
      this.layersSelected.map((i, ii) => {
        this.$delete(this.composition.layers, ii)
      })
      this.$set(this, 'layersSelected', [])
      // set layerIndexPlay, layerIndex, mode?
      // find tha smallest index to go to?
    },
    layersSelectedCreateNode () {
      this.$log('layersSelectedCreateNode start')
      // open node-editor modal? or just save it to workspace as node?
      let nodeInput = {
        wsItemType: 'NODE',
        name: '',
        spheres: [],
        category: 'FUN',
        layout: 'PIP',
        items: [
          {
            oid: Date.now().toString(),
            contentOid: this.meta.content.oid,
            layers: this.layersSelected.reduce((acc, val) => {
              acc.push(this.meta.layers[val])
              return acc
            }, []),
            spheres: [],
            operation: {
              items: null,
              operations: null,
              type: 'CONCAT'
            }
          }
        ]
      }
      this.$log('layersSelectedCreateNode nodeInput', nodeInput)
      this.layersSelected = []
      this.$router.push({name: 'workspace', params: {page: 'node'}, query: {node: JSON.stringify(nodeInput)}})
    },
    layersSelectedDrop () {
      this.$log('layersSelectedDrop')
      this.$set(this, 'layersSelected', [])
    },
    layerOnMove (e, evt) {
      this.$log('layerDragMove', e, evt)
      this.$log('layerIndexFuture', e.draggedContext.futureIndex)
      this.$set(this, 'layerIndexFuture', e.draggedContext.futureIndex + 1)
      // TODO why +1 ?
    },
    layerWorkspaceClick (l, li) {
      this.$log('layerWorkspaceClick', l, li)
      this.layerAdd(null, null, l)
      this.showLayersFromWorkspace = false
    },
    layerClick (l, li) {
      this.$log('layerClick', l, li)
      this.$emit('meta', ['mode', 'layer'])
      this.$emit('meta', ['layerIndexPlay', li])
      this.scrollOverflow = 'hidden'
    },
    layerConfirm () {
      this.$log('layerConfirm')
      this.$emit('meta', ['layerIndexPlay', -1])
      this.scrollOverflow = 'auto'
      this.$tween.to(this.$refs.extraNodesScroll, 0.2, {scrollTop: 0})
    },
    async layerAdd (startInput, endInput, layerInput) {
      this.$log('layerAdd start')
      this.$log('layerAdd inputs: ', startInput, endInput, layerInput)
      let start = startInput || this.meta.now - 3 > 0 ? this.meta.now - 3 : 0
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
    layerSetNameStart () {
      this.$log('layerSetNameStart')
      this.layerNameEditing = true
    },
    layersPlayAll () {
      this.$log('layersPlayAll')
      this.$emit('meta', ['layerIndex', 0])
      this.$emit('meta', ['layerIndexPlay', -1])
      this.$emit('meta', ['mode', 'play'])
      this.player.play()
    },
    layersWatch () {
      this.$log('layersWatch')
      this.$emit('meta', ['mode', 'watch'])
      this.$emit('meta', ['layerIndexPlay', -1])
      this.player.play()
    }
  }
}
</script>
