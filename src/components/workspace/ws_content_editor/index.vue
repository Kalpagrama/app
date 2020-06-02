<template lang="pug">
div(
  :style=`{
    position: 'relative',
    borderRadius: $q.screen.gt.xs ? '0px' : '0px',
    overflow: 'hidden'
  }`
  ).column.full-width.b-50
  //- q-drawer(v-model="menuShow" side="right")
  //-   menu-right(:tabs="tabs" :tab="tab" @tab="tab = $event, menuShow = false").b-50
  composition(
    ctx="workspace" :visible="true" :active="true" :mini="false"
    :value="value").full-height
    template(v-if="$q.screen.gt.xs" v-slot:header)
      kalpa-debug(:options=`{editorType}`)
      div(:style=`{height: '70px'}`
        ).row.full-width.items-center.content-center.q-px-sm
        q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$emit('close')").q-mr-sm
        span.text-white.text-bold {{ contentName }}
    template(v-slot:video)
      q-btn(
        v-if="pageId === 'layers'"
        round push color="green" icon="add" @click="layerAdd()"
        :size="$q.screen.gt.xs ? 'lg' : 'md'"
        :style=`{
          position: 'absolute', zIndex: 2000, bottom: '18px', right: '18px',
          borderRadius: '50%'
        }`)
    template(v-slot:editor=`{player, meta}`)
      div(
        :style=`{
        }`
        ).column.fit
        .col.full-width.scroll
          component(
            :editorType="editorType"
            :ref="`ref-edit-${pageId}`"
            :is="`edit-${pageId}`"
            :player="player" :meta="meta" :composition="value"
            @pageId="pageId = $event"
            :pages="pages" :pageId="pageId"
            @close="$emit('close')")
    template(v-slot:footer)
      div(
        :style=`{
          borderRadius: '10px',
          overflow: 'hidden'
        }`
        ).row.full-width.justify-center.q-pb-sm
        kalpa-buttons(:value="pages" :id="pageId" idKey="id" @id="pageId = $event").justify-center
</template>

<script>
import menuRight from './menu_right'
import editInfo from './edit_info'
import editLayers from './edit_layers'
import editWorkspace from './edit_workspace'

export default {
  name: 'wsContentEditor',
  components: {menuRight, editInfo, editLayers, editWorkspace},
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
      pages: [
        {id: 'info', name: 'Info'},
        {id: 'layers', name: 'Layers'},
        {id: 'workspace', name: 'Library'}
      ],
      menuShow: false
    }
  },
  computed: {
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
    layerAdd () {
      this.$log('layerAdd')
      let ref = this.$refs['ref-edit-layers']
      if (ref) ref.layerAdd()
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
