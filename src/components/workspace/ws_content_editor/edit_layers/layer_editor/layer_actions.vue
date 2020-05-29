<template lang="pug">
div(
  :style=`{
    position: 'relative',
    height: '160px'
  }`).row.full-width.items-start.content-start
  //- layer spheres
  q-dialog(v-model="layerSpheresEditorOpened" position="bottom")
    layer-spheres(
      :layer="layer"
      @close="layerSpheresEditorOpened = false"
      :style=`{
        maxWidth: $q.screen.xs ? $q.screen.width+'px' : 600+'px',
        maxHeight: $q.screen.xs ? $q.screen.height-60+'px' : $q.screen.height*0.7+'px',
        minHeight: $q.screen.xs ? $q.screen.height-60+'px' : $q.screen.height*0.7+'px',
      }`)
  layer-progress(:layer="layer" :layerIndex="layerIndex" :player="player" :meta="meta")
  div(
    :style=`{
      borderRadius: '0 0 10px 10px', overflow: 'hidden',
      paddingLeft: '60px', paddingRight: '60px',
    }`
    ).row.full-width.items-center.content-center.q-py-sm
    q-btn(round flat color="white" icon="first_page" @click="layerSet(0)").b-90.q-mr-sm
    q-btn-group(flat color="white" :style=`{borderRadius: '10px'}`).q-mr-sm
      q-btn(round flat color="white" icon="keyboard_arrow_left" @click="layerForward(0,0)").b-90
      q-btn(round flat color="white" icon="keyboard_arrow_right" @click="layerForward(0,1)").b-90
    .col
    q-btn-group(flat color="white" :style=`{borderRadius: '10px'}`).q-mr-sm
      q-btn(round flat color="white" icon="keyboard_arrow_left" @click="layerForward(1,0)").b-90
      q-btn(round flat color="white" icon="keyboard_arrow_right" @click="layerForward(1,1)").b-90
    q-btn(round flat color="white" icon="last_page" @click="layerSet(1)").b-90
  //- div(:style=`{}`).row.full-width.items-center.content-center.q-pa-sm
  //-   q-btn(round flat color="white" icon="tune" @click="layerSpheresEditorOpened = !layerSpheresEditorOpened").b-110
  //-   .col
  //-   q-btn(round color="green" icon="check" @click="layerClose()").b-110
</template>

<script>
import layerProgress from './layer_progress'
import layerSpheres from './layer_spheres'

export default {
  name: 'layerItem-layerActions',
  components: {layerProgress, layerSpheres},
  props: ['player', 'meta', 'layer', 'mode', 'layerIndex'],
  data () {
    return {
      layerSpheresEditorOpened: false
    }
  },
  computed: {
  },
  methods: {
    layerClose () {
      this.$log('layerClose')
      this.$emit('mode', 'norm')
      this.player.meta(['mode', 'content'])
    },
    layerSet (index) {
      this.$log('layerSet', index)
      this.layer.figuresAbsolute[index].t = this.meta.now
    },
    layerForward (index, isRight) {
      this.$log('layerForward', index, isRight)
      let t = this.layer.figuresAbsolute[index].t + (isRight ? 0.1 : -0.1)
      this.layer.figuresAbsolute[index].t = t
      this.player.pause()
      this.player.setCurrentTime(t)
      this.player.update(t)
    }
  }
}
</script>
