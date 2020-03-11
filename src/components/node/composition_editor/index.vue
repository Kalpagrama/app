<template lang="pug">
div(:style=`{position: 'relative'}`).row.fit
  q-resize-observer(@resize="onResize")
  //- actions
  //- q-btn(
  //-   outline color="red" no-caps @click="$emit('hide')"
  //-   :style=`{position: 'absolute', zIndex: 9000, top: '16px', borderRadius: '10px', left: '16px'}`) Cancel
  //- q-btn(
  //-   push color="green" no-caps @click="$emit('hide')"
  //-   :style=`{position: 'absolute', zIndex: 9000, top: '16px', borderRadius: '10px', right: '16px'}`) Ready
  //- composition with COMPOSER slot
  composition(
    v-if="composition" :value="composition"
    :ctx="ctx"
    :visible="true" :active="true" :mini="false"
    :styles=`layoutVertical ? {paddingBottom: '400px'} : {paddingRight: '450px'}`).fit
    template(v-slot:editor=`{player, meta}`)
      video-composer(v-if="composition" :ctx="ctx" :composition="composition" :player="player" :meta="meta" :layoutVertical="layoutVertical")
</template>

<script>
import videoComposer from './video_composer'

export default {
  name: 'compositionEditor',
  components: {videoComposer},
  props: {
    ctx: {type: String, default () { return 'workspace' }},
    inDialog: {type: Boolean},
    mode: {type: String, default () { return 'content' }},
    node: {type: Object, required: true},
    saving: {type: Boolean},
    compositionIndex: {type: Number, required: true, default () { return 0 }}
  },
  data () {
    return {
      width: 0,
      height: 0
    }
  },
  computed: {
    composition () {
      return this.node.compositions[this.compositionIndex]
    },
    layoutVertical () {
      return this.width < (this.height * 0.7) + 450
    }
  },
  methods: {
    onResize (e) {
      this.width = e.width
      this.height = e.height
    }
  }
}
</script>
