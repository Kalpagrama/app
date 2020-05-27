<template lang="pug">
div(
  :style=`{
    position: 'relative',
    borderRadius: $q.screen.gt.xs ? '10px' : '0px',
    overflow: 'hidden'
  }`
  ).column.fit.b-50
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
            editorType="content"
            :ref="`ref-edit-${tab}`" :is="`edit-${tab}`"
            :player="player" :meta="meta" :composition="value")
</template>

<script>
import editInfo from './edit_info'
import editLayers from './edit_layers'

export default {
  name: 'wsContentEditor',
  components: {editInfo, editLayers},
  props: {
    value: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      toolsHeight: 60,
      editing: false,
      tab: 'layers',
      tabs: [
        {id: 'info', name: 'Info'},
        {id: 'layers', name: 'Layers'}
      ]
    }
  },
  computed: {
    contentName () {
      return this.value.name.slice(0, 40)
    }
  },
  watch: {
    editing: {
      handler (to, from) {
        this.$log('editing CHANGED', to)
        this.$tween.to(this, 0.5, {toolsHeight: to ? 500 : 60})
      }
    }
  },
  methods: {
    layerAdd () {
      this.$log('layerAdd')
      let ref = this.$refs['ref-edit-layers']
      if (ref) ref.layerAdd()
    },
    editStart () {
      this.$log('editStart')
      this.editing = !this.editing
      // let h = this.$el.clientHeight
      // this.$log('h', h)
      // this.$tween.to(this, 0.5, {toolsHeight: 500})
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
