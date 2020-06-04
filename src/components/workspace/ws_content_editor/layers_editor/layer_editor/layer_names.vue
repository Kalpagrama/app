<template lang="pug">
div(
  :style=`{
    position: 'relative',
    borderRadius: '10px 10px 0 0',
    overflow: 'hidden',
  }`
  ).column.fit.q-pa-sm.b-70
  //- layer name dialog editor for mobile only
  q-dialog(
    v-model="layerNameEditorOpened" position="bottom")
    div(
      :style=`{
        minHeight: $q.screen.height-60+'px',
        maxHeight: $q.screen.height-60+'px',
        borderRadius: '10px 10px 0 0',
      }`).column.fit.b-70
      .row.full-width.q-pa-sm
        q-input(
          v-model="name"
          ref="nameInput"
          filled dark color="white"
          autogrow autofocus
          :label="'Set layer name'"
          @focus="inputFocused"
          @blur="inputBlurred"
          :style=`{borderRadius: '10px', overflow: 'hidden', transform: 'translate3d(0,0,0)'}`
          ).full-width
      .row.full-width.q-pa-sm
        .col
        q-btn(round flat color="white" icon="check" @click="opened = false").b-80
      .col.full-width
  //- layer spheres editor
  //- q-dialog(
  //-   v-model="layerSpheresEditorOpened")
  div.row.full-width
    q-input(
      ref="layerNameInput"
      :value="layerName" @input="layerNameChanged"
      @focus="layerNameFocused"
      @blur="layerNameBlurred"
      filled dark dense color="grey-6"
      autogrow
      label="Notes"
      :input-style=`{minHeight: '90px'}`
      :style=`{
        transform: 'translate3d(0,0,0)',
        borderRadius: '10px',
        overflow: 'hidden',
      }`
      ).full-width
  div(v-if="stateEditor.layerNameFocused").row.full-width.q-py-sm
    .col
    q-btn(
      push no-caps color="green" @click="stateEditor.set('layerNameFocused', false)").q-px-md Save
  //- spheres
  //- div.row.full-width.q-py-sm
  //-   q-input(
  //-     v-model="sphereName"
  //-     filled dark dense color="grey-6"
  //-     label="Add sphere or create").full-width
  //- .col.full-width
  //-   ws-sphere-list(
  //-     :showHeader="false"
  //-     :showItems="showSpheresFromWs"
  //-     @sphereClick="sphereClickWs($event), showSpheresFromWs = false"
  //-     @created="sphereCreated($event), showSpheresFromWs = false"
  //-     @searchStarted="showSpheresFromWs = true"
  //-     @searchEnded="showSpheresFromWs = false"
  //-     :style=`{
  //-       borderRadius: '10px',
  //-       overflow: 'hidden',
  //-     }`).full-height.b-50
  //-     template(v-slot:header)
  //-     //-   .row.full-width.q-px-sm.q-py-md
  //-     //-     span.text-white.text-bold Spheres
  //-     template(v-slot:items=`{items, searchString}`)
  //-       div().row.full-width.items-start.content-start
  //-         div(v-if="searchString.length === 0").row.full-width.q-py-sm
  //-           ws-sphere(
  //-             v-for="(s,si) in node.spheres" :key="si"
  //-             :sphere="s"
  //-             @sphereClick="sphereClick(s,si)"
  //-             ).q-mr-sm.q-mb-sm
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
    }
  },
  watch: {
  },
  methods: {
    sphereClickWs (sphere) {
      this.$log('sphereClickWs', sphere)
    },
    sphereClick (sphere) {
      this.$log('sphereClick', sphere)
    },
    sphereCreated (sphere) {
      this.$log('sphereCreated', sphere)
    },
    layerNameChanged (e) {
      this.$log('layerNameChanged', e)
      if (this.layer.spheres.length === 0) this.$set(this.layer.spheres, 0, {name: ''})
      this.$set(this.layer.spheres[0], 'name', e)
    },
    async layerNameFocused () {
      this.$log('layerNameFocused')
      this.stateEditor.set('layerNameFocused', true)
      // await this.$wait(1000)
      // let ref = this.$refs.layerNameInput
      // this.$log('ref', ref)
      // ref.layerNameInput.focus()
    },
    layerNameBlurred () {
      this.$log('layerNameBlurred')
      this.stateEditor.set('layerNameFocused', false)
    },
    inputFocused () {
      this.$log('inputFocused')
    },
    inputBlurred () {
      this.$log('inputBlurred')
    }
  },
  mounted () {
    this.$log('mounted')
  }
}
</script>
