<template lang="pug">
div(:style=`{position: 'relative'}`).row.fit
  //- if we got composition of the node ??
  //- how to delete composition from the node
  div(v-if="node.compositions[compositionIndex]").col.full-height
    editor-video(
      v-if="composition && content.type === 'VIDEO'"
      :composition="composition" :content="content"
      @layerExport="$emit('layerExport', $event)")
    editor-image(
      v-if="composition && content.type === 'IMAGE'"
      :composition="composition" :content="content")
  //- TODO: where to finder to be? inside composition editor
  //- does it using somewhere else ??
  div(v-else).row.fit.items-center.content-center.justify-center
    q-dialog(v-model="compositionFinderOpened")
      composition-finder(@layer="layerFound")
    q-btn(round flat size="lg" color="green" icon="add" @click="compositionAdd()")
</template>

<script>
import { throttle } from 'quasar'
import editorVideo from './editor_video/index.vue'
import editorImage from './editor_image/index.vue'

export default {
  name: 'compositionEditor',
  components: {editorVideo, editorImage},
  props: {
    ctx: {
      type: String
    },
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
      nodeSavingError: null,
      compositionFinderOpened: false
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
    compositionIndex: {
      immediate: true,
      handler (to, from) {
        this.$log('compositionIndex CHANGED', to)
        if (to !== undefined) {
          if (!this.node.compositions[to]) {
            // TODO: try to add composition to the node...
          }
        }
      }
    },
    node: {
      deep: true,
      immediate: true,
      handler (to, from) {
        if (to) {
          if (this.ctx === 'composition') {
            // this.nodeSave()
          }
        }
      }
    }
  },
  methods: {
    layerFound (l) {
      this.$log('layerFound', l)
      // add layer to existing composition
      if (this.node.compositions[this.compositionIndex]) {
        // TODO: and if there is another content????
        this.node.compositions[this.compositionIndex].layers.push(l)
      }
      // create new composition with given index and layer
      else {
        let c = {
          url: '',
          name: '',
          layers: [l]
        }
        this.$set(this.node.compositions, this.compositionIndex, c)
        // this.node.compositions[this.compositionIndex] = c
      }
      this.compositionFinderOpened = false
    },
    compositionAdd () {
      this.$log('compositionAdd')
      // open modal to export layers from node CONTENT?
      // find only content and do it live?
      this.compositionFinderOpened = true
    },
    compositionExport () {
      this.$log('compositionExport')
    },
    compositionDelete () {
      this.$log('compositionDelete')
    },
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
    this.nodeSave = throttle(this.nodeSave, 2000)
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
