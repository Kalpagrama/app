<template lang="pug">
div(:style=`{position: 'relative'}`).row.full-width
  img(
    ref="previewRef"
    :src="ctx === 'inEditor' ? fragment.content.thumbUrl : fragment.thumbUrl"
    @load="previewLoad" @error="previewError"
    :style=`{width: '100%', maxHeight: $q.screen.height+'px', objectFit: 'contain', userSelect: 'none', pointerEvents: 'none'}`)
  div(
    v-if="previewLoaded && fragment"
    :style=`{position: 'absolute', zIndex: 100, minHeight: '100%', minWidth: '100%'}`).row.fit
    fragment-video(
      v-if="fragment.content.type === 'VIDEO'"
      ref="fragmentVideo"
      :index="index" :ctx="ctx" :fragment="fragment" :active="active" :visible="visible" :mini="mini"
      :width="previewWidth" :height="previewHeight"
      @player="$emit('player', $event)")
    //- fragment-image(v-if="fragment && fragment.content.type === 'IMAGE")
    //- fragment-book(v-if="fragment && fragment.content.type === 'BOOK")
//- editors slot
</template>

<script>
import fragmentVideo from './fragment_video'

export default {
  name: 'nodeFragment',
  components: {fragmentVideo},
  props: ['index', 'ctx', 'fragment', 'active', 'visible', 'mini', 'stageFirst'],
  data () {
    return {
      stage: 0,
      previewLoaded: false,
      previewHeight: 0,
      previewWidth: 0
    }
  },
  watch: {
    fragment: {
      immediate: true,
      handler (to, from) {
        this.$log('fragment CHANGED', to)
        if (to) {
        } else {
        }
        if (this.stageFirst) this.stage = this.stageFist
      }
    }
  },
  methods: {
    previewLoad () {
      this.$log('previewLoad')
      let h = this.$refs.previewRef.clientHeight
      let w = this.$refs.previewRef.clientWidth
      this.$emit('previewHeight', h)
      this.$emit('previewWidth', w)
      this.previewHeight = h
      this.previewWidth = w
      this.previewLoaded = true
    },
    previewError (e) {
      this.$log('previewError', e)
    }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
