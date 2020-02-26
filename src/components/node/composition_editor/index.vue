<template lang="pug">
div(:style=`{position: 'relative'}`).row.fit
  q-btn(outline color="red" no-caps @click="$emit('close')"
    :style=`{position: 'absolute', zIndex: 9000, top: '16px', borderRadius: '10px', left: '16px'}`) Cancel
  q-btn(push color="green" no-caps @click="$emit('close')"
    :style=`{position: 'absolute', zIndex: 9000, top: '16px', borderRadius: '10px', right: '16px'}`) Ready
  composition(
    v-if="composition" :value="composition"
    :ctx="ctx"
    :visible="true" :active="true" :mini="false")
    template(v-slot:editor=`{player, meta}`)
      editor-video(
        v-if="composition"
        :ctx="ctx" :composition="composition" :player="player" :meta="meta")
</template>

<script>
import { debounce } from 'quasar'
import editorVideo from './editor_video/index.vue'

export default {
  name: 'compositionEditor',
  components: {editorVideo},
  props: {
    ctx: {type: String, default () { return 'workspace' }},
    value: {type: Object, required: true},
    compositionIndex: {type: Number, required: true, default () { return 0 }}
  },
  data () {
    return {
      node: null,
      nodeRes: null,
      nodeSavePause: false,
      nodeSaving: false,
      nodeSavingError: null,
      compositionFinderOpened: false
    }
  },
  computed: {
    composition () {
      if (this.node) return this.node.compositions[this.compositionIndex]
      else return null
    },
    content () {
      if (this.composition) return this.composition.layers[0].content
      else return null
    }
  },
  watch: {
    value: {
      deep: true,
      immediate: true,
      handler (to, from) {
        this.$log('value CHANGED', to)
        if (to && this.node && this.ctx === 'editor') return
        if (to && !this.nodeSaving) {
          this.nodeSavePause = true
          this.node = JSON.parse(JSON.stringify(to))
        }
      }
    },
    node: {
      deep: true,
      immediate: false,
      handler (to, from) {
        this.$log('node CHANGED', to, this.nodeSavePause)
        if (to) {
          if (this.ctx === 'workspace') {
            if (this.nodeSavePause) {
              this.nodeSavePause = false
            } else {
              this.nodeSave(to)
            }
          }
          else {
            this.$emit('composition', to.compositions[this.compositionIndex])
          }
        }
      }
    }
  },
  methods: {
    async nodeSave (node) {
      try {
        this.$log('nodeSave start', node)
        // if (this.nodeSaving) return
        this.nodeSaving = true
        await this.$store.dispatch('workspace/wsNodeSave', JSON.parse(JSON.stringify(node)))
        this.nodeSaving = false
        this.nodeSavingError = null
      } catch (e) {
        this.$log('nodeSave error', e)
        this.nodeSaving = false
        this.nodeSavingError = e
      }
    }
  },
  created () {
    this.nodeSave = debounce(this.nodeSave, 2500)
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    this.$emit('composition', this.node.compositions[this.compositionIndex])
  }
}
</script>
