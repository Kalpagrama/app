<template lang="pug">
div(:style=`{position: 'relative'}`).row.fit
  .col.full-height
    editor-video(
      v-if="composition && content.type === 'VIDEO'"
      :composition="composition" :content="content")
    editor-image(
      v-if="composition && content.type === 'IMAGE'"
      :composition="composition" :content="content")
</template>

<script>
import editorVideo from './editor_video/index.vue'
import editorImage from './editor_image/index.vue'

export default {
  name: 'compositionEditor',
  components: {editorVideo, editorImage},
  props: {
    node: {
      type: Object,
      required: true
    },
    compositionIndex: {
      type: Number,
      required: true,
      default () {
        return 0
      }
    }
  },
  data () {
    return {
    }
  },
  computed: {
    composition () {
      if (this.node && this.compositionIndex !== undefined) {
        return this.node.compositions[this.compositionIndex]
      } else {
        return null
      }
    },
    content () {
      if (this.composition) {
        return this.composition.layers[0].content
      } else {
        return null
      }
    }
  },
  watch: {
    node: {
      immediate: true,
      handler (to, from) {
        this.$log('node CHANGED', to)
        // TODO: what to do on change? save to ws?
      }
    }
  },
  methods: {
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
