<template lang="pug">
div(:style=`{position: 'relative'}`).row.fit
  video-composer(:ctx="ctx" :mode="mode" :composition="composition" @cancel="$emit('cancel')")
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
  computed: {
    composition () {
      return this.node.compositions[this.compositionIndex]
    }
  }
}
</script>
