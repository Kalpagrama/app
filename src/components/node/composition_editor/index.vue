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
import { throttle } from 'quasar'
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
      nodeSaving: false,
      nodeSavingError: null
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
      deep: true,
      immediate: true,
      handler (to, from) {
        if (to) this.nodeSave()
      }
    }
  },
  methods: {
    async nodeSave (node) {
      try {
        this.$log('nodeSave start', this.node)
        this.nodeSaving = true
        let res = await this.$store.dispatch('workspace/wsNodeSave', JSON.parse(JSON.stringify(this.node)))
        this.$log('res', res)
        this.nodeSaving = false
        this.nodeSavingError = null
        // this.node = res
        this.$log('nodeSave done')
      } catch (e) {
        this.$log('nodeSave error', e)
        this.nodeSaving = false
        this.nodeSavingError = e
      }
    }
  },
  created () {
    this.nodeSave = throttle(this.nodeSave, 500)
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
