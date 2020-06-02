<template lang="pug">
div(
  :style=`{
    position: 'relative',
    borderRadius: '10px 10px 0 0',
    overflow: 'hidden',
  }`
  ).column.fit.q-pa-sm.b-70
  //- layer name
  q-dialog(
    v-model="opened" position="bottom")
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
  //- layer spheres
  q-dialog(
    v-model="layerSpheresEditorOpened")
  div.row.full-width
    q-btn(
      @click="opened = true"
      flat no-caps color="white"
      ).b-80.text-white.text-bold {{layerName}}
  div.row.full-width.q-py-sm
    q-btn(
      v-if="true"
      flat no-caps color="white"
      ).b-80
      q-icon(name="edit" color="white" size="18px").q-mr-sm
      span Edit spheres
  div.row.full-width
    ws-sphere(
      v-for="(s,si) in layer.spheres" :key="si"
      v-if="si > 0"
      :sphere="s" :sphereIndex="si")
</template>

<script>
import layerSpheres from './layer_spheres'

export default {
  name: 'layerNames',
  components: { layerSpheres },
  props: ['player', 'meta', 'layer', 'mode', 'layerIndex'],
  data () {
    return {
      name: '',
      opened: false,
      layerSpheresEditorOpened: false
    }
  },
  computed: {
    layerName () {
      if (this.layer.spheres.length > 0) return this.layer.spheres[0].name
      else return 'Set layer name'
    }
  },
  watch: {
    opened: {
      async handler (to, from) {
        this.$log('opened CHANGED', to)
      }
    }
  },
  methods: {
    inputFocused () {
      this.$log('inputFocused')
      // this.opened = true
    },
    inputBlurred () {
      this.$log('inputBlurred')
      // this.layer.spheres[0] = {name: this.name}
      this.$set(this.layer.spheres, 0, {name: this.name})
      this.opened = false
    }
  },
  mounted () {
    this.$log('mounted')
    if (this.layer.spheres.length > 0) {
      this.name = this.layer.spheres[0].name
    }
  }
}
</script>
