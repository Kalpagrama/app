<template lang="pug">
div(
  :style=`{
    position: 'relative',
    borderRadius: $q.screen.gt.xs ? '10px' : '0px',
    overflow: 'hidden'
  }`
  ).column.full-width.b-50
  q-drawer(v-model="menuShow" side="right")
    menu-right(:tabs="tabs" :tab="tab" @tab="tab = $event, menuShow = false").b-50
  composition(
    ctx="workspace" :visible="true" :active="true" :mini="false"
    :value="value").full-height
    template(v-slot:header)
      div(:style=`{height: '70px'}`
        ).row.full-width.items-center.content-center.q-px-sm
        q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$emit('close')")
        span.text-white.text-bold {{ contentName }}
    template(v-slot:video)
      q-btn(
        v-if="tab === 'layers'"
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
            @menuToggle="menuShow = !menuShow"
            :editorType="editorType"
            :ref="`ref-edit-${tab}`" :is="`edit-${tab}`"
            :player="player" :meta="meta" :composition="value")
</template>

<script>
import menuRight from './menu_right'
import editInfo from './edit_info'
import editLayers from './edit_layers'

export default {
  name: 'wsContentEditor',
  components: {menuRight, editInfo, editLayers},
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
      tab: 'layers',
      tabs: [
        {id: 'info', name: 'Info'},
        {id: 'layers', name: 'Layers'}
      ],
      menuShow: false
    }
  },
  computed: {
    contentName () {
      let res = this.value.name.slice(0, 40)
      if (res.length === 0) return 'Content editor'
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
