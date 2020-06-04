<style lang="sass">
.q-tab
  border-radius: 10px !important
  overflow: hidden
.q-tab-panels
  background: none !important
.q-tab-panel
  padding: 0
  margin: 0
</style>

<template lang="pug">
div(
  :style=`{
    position: 'relative',
    borderRadius: $q.screen.gt.xs ? '0px' : '0px',
    overflow: 'hidden'
  }`
  ).column.full-width.b-50
  composition(
    ctx="workspace"
    :visible="true" :active="true" :mini="false"
    :value="value").full-height
    template(v-if="showHeader" v-slot:header)
      //- kalpa-debug(:options=`{editorType,pageId}`)
      div(:style=`{height: '70px'}`
        ).row.full-width.items-center.content-center.q-px-sm
        q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$emit('close')").q-mr-sm
        span.text-white.text-bold {{ contentName }}
    template(v-slot:video)
      q-btn(
        v-show="pageId === 'layers'"
        round push color="green" icon="add" @click="$refs.layersEditor.layerAdd()"
        :size="$q.screen.gt.xs ? 'lg' : 'md'"
        :style=`{
          position: 'absolute', zIndex: 2000, bottom: '18px', right: '18px',
          borderRadius: '50%'
        }`)
    template(v-slot:editor=`{player, statePlayer}`)
      .column.fit
        //- header bar
        //- div(:style=`{marginTop: '-20px', paddingTop: '20px'}`).row.full-width
        //-   div(:style=`{height: '70px', borderRadius: '0 0 10px 10px'}`).row.full-width.b-60
        //- body
        q-tab-panels(
          v-model="pageId" animated
          keep-alive infinite
          :swipeable="!layerEditorOpened"
          ).col.full-width
          q-tab-panel(name="info")
            info-editor(
              :editorType="editorType"
              :composition="statePlayer.composition"
              :player="player"
              :statePlayer="statePlayer"
              :stateEditor="stateEditor")
          q-tab-panel(name="layers")
            layers-editor(
              ref="layersEditor"
              :editorType="editorType"
              :composition="statePlayer.composition"
              :player="player"
              :statePlayer="statePlayer"
              :stateEditor="stateEditor")
          q-tab-panel(name="workspace")
            layers-workspace(
              @pick="layerAdd"
              :editorType="editorType"
              :composition="statePlayer.composition"
              :player="player"
              :statePlayer="statePlayer"
              :stateEditor="stateEditor")
        //- footer
        transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
          div(v-if="!layerEditorOpened").row.full-width.justify-between.q-pa-sm
            q-btn(round flat dense color="grey-5" icon="keyboard_arrow_left" @click="$emit('close')")
            q-tabs(
              v-model="pageId"
              align="center"
              active-color="white"
              active-bg-color="green"
              dense color="white"
              :style=`{borderRadius: '10px'}`).b-60
              q-tab(
                v-for="(p,pkey) in pages" :key="pkey"
                :name="pkey"
                :label="p.name"
                no-caps content-class="text-white"
                :style=`{color: 'white'}`)
            q-btn(round flat dense color="green" icon="check" @click="$emit('close')")
</template>

<script>
import infoEditor from './info_editor'
import layersEditor from './layers_editor'
import layersWorkspace from './layers_workspace'

export default {
  name: 'wsContentEditor',
  components: {infoEditor, layersEditor, layersWorkspace},
  props: {
    editorType: {
      value: String,
      default () {
        return 'content'
      }
    },
    value: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      pageId: 'layers',
      layerEditorOpened: false,
      layerNameFocused: false
    }
  },
  computed: {
    stateEditor () {
      return {
        pageId: this.pageId,
        pages: this.pages,
        layerEditorOpened: this.layerEditorOpened,
        layerNameFocused: this.layerNameFocused,
        set: (key, val) => {
          this[key] = val
        }
      }
    },
    pages () {
      let res = {
        info: {name: 'Info'},
        layers: {name: 'Layers'}
      }
      if (this.editorType === 'composition') {
        res.workspace = {name: 'Workspace'}
      }
      // res.workspace = {name: 'Workspace'}
      return res
    },
    showHeader () {
      return this.$q.screen.gt.xs
      // return true
    },
    contentName () {
      let res = this.value.name.slice(0, 40)
      if (res.length === 0) {
        if (this.editorType === 'composition') return 'Composition editor'
        else return 'Content editor'
      }
      else return res
    }
  },
  watch: {
  },
  methods: {
    layerAdd (val) {
      this.$log('layerAdd')
      let ref = this.$refs.layersEditor
      this.$log('layerAdd ref', ref)
      if (ref) ref.layerAdd(val)
      this.pageId = 'layers'
    }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
