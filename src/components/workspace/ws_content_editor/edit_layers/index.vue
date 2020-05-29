<template lang="pug">
div(:style=`{position: 'relative'}`).column.fit
  q-resize-observer(@resize="onResize")
  //- layer from workspace
  q-dialog(v-model="layersWorkspaceShow" position="bottom")
    ws-content-list(
      ctx="nodeEditor" @layer="layerFound"
      :style=`{
        maxWidth: $q.screen.xs ? $q.screen.width+'px' : 600+'px',
        maxHeight: $q.screen.xs ? $q.screen.height-60+'px' : $q.screen.height*0.7+'px',
        minHeight: $q.screen.xs ? $q.screen.height-60+'px' : $q.screen.height*0.7+'px',
      }`).b-30
      template(v-slot:header)
        div(:style=`{height: '60px', marginBottom: '20px'}`).row.full-width.items-center.content-center.q-px-sm
          q-btn(round flat color="white" icon="keyboard_arrow_left" @click="layersWorkspaceShow = false")
          span.text-white.text-bold Find layer
  //- layer editor
  transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
    layer-editor(
      v-if="layerEditing"
      v-bind="$props"
      :width="width"
      @close="layerEditing = null"
      :style=`{
        position: 'absolute', zIndex: 2000,
        borderRadius: '10px', overflow: 'hidden'
      }`)
  //- body
  .col.full-width
    layer-list(v-bind="$props" @layerId="layerClicked")
  //- footer
  transition(enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
    div(
      v-if="!layerEditing"
      :style=`{
        zIndex: 1000,
        borderRadius: '10px',
        overflow: 'hidden',
      }`
      ).row.full-width.items-end.content-end.justify-center.q-px-sm.q-pb-sm.b-50
      kalpa-buttons(:value="pages" :id="pageId" idKey="id" @id="$emit('pageId', $event)")
  //-     //- q-btn(
  //-     //-   round icon="edit" @click="layersEdit()"
  //-     //-   :flat="!layersEditing"
  //-     //-   :color="layersEditing ? 'green' : 'white'").b-90.q-mr-sm
  //-     //- q-btn(
  //-     //-   v-if="editorType === 'composition'"
  //-     //-   round flat color="white" icon="play_arrow" @click="compositionPlay()"
  //-     //-   ).b-90.q-mr-sm
  //-     .col
  //-     //- q-btn(
  //-     //-   v-if="editorType === 'content'"
  //-     //-   round flat color="white" icon="search").b-90.q-mr-sm
  //-     //- q-btn(
  //-     //-   v-if="editorType === 'content'"
  //-     //-   round flat color="white" icon="sort" @click="layersSort()").b-90.q-mr-sm
  //-     q-btn(
  //-       v-if="editorType === 'composition'"
  //-       flat color="white" icon="school" icon-right="add" @click="layerAddFromWorkspace()"
  //-       :style=`{height: '42px'}`).b-90.q-mr-sm
  //-     //- menu toggle
  //-     //- q-btn(
  //-     //-   round flat color="white" icon="menu_open"  @click="$emit('menuToggle')"
  //-     //-   ).b-90
</template>

<script>
import layerList from './layer_list'
import layerEditor from './layer_editor'

export default {
  name: 'editLayers',
  components: {layerList, layerEditor},
  props: ['editorType', 'player', 'meta', 'composition', 'pages', 'pageId'],
  data () {
    return {
      width: 0,
      layerEditing: null,
      layersWorkspaceShow: false
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
    // 'meta.layerId': {
    //   async handler (to, from) {
    //     this.$log('meta.layerId CHANGED', to)
    //     if (!to) return
    //     // await this.$wait(100)
    //     let ref = this.$refs[`layer-${to}`][0]
    //     let scrollTop = ref.offsetTop - 4
    //     this.$tween.to(this.$refs.extraLayersScrollArea, 0.5, {scrollTop: scrollTop})
    //   }
    // }
  },
  methods: {
    compositionPlay () {
      this.$log('compositionPlay')
      if (this.meta.mode === 'composition') {
        if (this.meta.playing) this.player.pause()
        else this.player.play()
      }
      else {
        this.player.meta(['mode', 'composition'])
        this.player.play()
      }
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
    layersDraggingMove (e, evt) {
      this.$log('layersDraggingMove', e.draggedContext.futureIndex)
      this.$set(this, 'layersDraggingFutureIndex', e.draggedContext.futureIndex + 1)
    },
    layersDraggingUpdate (e, evt) {
      this.$log('layersDraggingUpdate', e, evt)
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
      this.$nextTick(() => {
        this.player.meta(['layerId', layerId])
        this.player.meta(['mode', 'layer'])
      })
      this.layerEditing = layerId
      this.$log('layerAdd done')
    },
    onResize (e) {
      this.$log('onResize', e)
      this.width = e.width
    }
  }
}
</script>
