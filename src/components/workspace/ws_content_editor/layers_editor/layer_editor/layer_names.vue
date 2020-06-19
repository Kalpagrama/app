<template lang="pug">
div(
  :style=`{
    position: 'relative',
    borderRadius: '10px 10px 0 0',
    overflow: 'hidden',
  }`
  ).column.fit.q-pa-sm.b-70
  //- header
  div.row.full-width
    q-input(
      ref="layerNameInput"
      :value="layerName"
      @input="layerNameChanged"
      @focus="layerNameFocused"
      @blur="layerNameBlurred"
      filled dark dense color="grey-6"
      :autofocus="autofocusInitial"
      autogrow
      label="Notes"
      placeholder="What you see here?"
      :input-style=`{minHeight: '90px'}`
      :style=`{
        transform: 'translate3d(0,0,0)',
        borderRadius: $store.state.ui.borderRadius+'px',
        overflow: 'hidden',
      }`
      ).full-width
  //- save?
  div(v-if="stateEditor.layerNameFocused").row.full-width.q-py-sm
    .col
    q-btn(
      @click="stateEditor.set('layerNameFocused', false)"
      flat no-caps color="green" icon="check")
</template>

<script>
import layerSpheres from './layer_spheres'

export default {
  name: 'layerNames',
  components: { layerSpheres },
  props: ['stateEditor', 'player', 'statePlayer', 'layer', 'mode', 'layerIndex'],
  data () {
    return {
      layerNameEditorOpened: false,
      layerSpheresEditorOpened: false,
      sphereName: '',
      showSpheresFromWs: false
    }
  },
  computed: {
    layerName () {
      if (this.layer.spheres.length > 0) return this.layer.spheres[0].name
      else return ''
    },
    autofocusInitial () {
      if (this.$q.screen.xs) return false
      else return true
    }
  },
  watch: {
  },
  methods: {
    layerNameChanged (e) {
      this.$log('layerNameChanged', e)
      if (this.layer.spheres.length === 0) this.$set(this.layer.spheres, 0, {name: ''})
      this.$set(this.layer.spheres[0], 'name', e)
    },
    async layerNameFocused () {
      this.$log('layerNameFocused')
      if (this.$q.screen.xs) {
        this.stateEditor.set('layerNameFocused', true)
      }
    },
    layerNameBlurred () {
      this.$log('layerNameBlurred')
      if (this.$q.screen.xs) {
        this.stateEditor.set('layerNameFocused', false)
      }
    },
  },
  mounted () {
    this.$log('mounted')
  }
}
</script>
