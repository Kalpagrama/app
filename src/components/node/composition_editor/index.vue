<template lang="pug">
div(:style=`{position: 'relative'}`).row.fit
  q-btn(
    v-if="inDialog"
    outline color="red" no-caps @click="$emit('close')"
    :style=`{position: 'absolute', zIndex: 9000, top: '16px', borderRadius: '10px', left: '16px'}`) Cancel
  q-btn(
    v-if="inDialog"
    push color="green" no-caps @click="$emit('close')"
    :style=`{position: 'absolute', zIndex: 9000, top: '16px', borderRadius: '10px', right: '16px'}`) Ready
  composition(
    v-if="composition" :value="composition"
    :ctx="ctx"
    :visible="true" :active="true" :mini="false")
    template(v-slot:editor=`{player, meta}`)
      editor-video(
        v-if="composition" :mode="mode"
        :ctx="ctx" :composition="node.compositions[compositionIndex]" :player="player" :meta="meta")
</template>

<script>
import { debounce } from 'quasar'
import editorVideo from './editor_video/index.vue'

export default {
  name: 'compositionEditor',
  components: {editorVideo},
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
    }
  },
  computed: {
    composition () {
      return this.node.compositions[this.compositionIndex]
    },
    content () {
      if (this.composition) return this.composition.layers[0].content
      else return null
    }
  },
  watch: {
    node: {
      handler (to, from) {
        this.$log('node CHANGED', to)
      }
    }
  }
}
</script>
