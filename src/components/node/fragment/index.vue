<template lang="pug">
div.row.full-width
  //- //- add fragment slot
  //- div(v-if="stage === 0 && ctx === 'inEditor'" @click="stage = 1").row.full-width.items-center.justify-center.bg-grey-1
  //-   q-btn(
  //-     outline no-caps color="green" icon="add" @click="stage = 1"
  //-     :style=`{height: '60px', borderRadius: '10px'}`).full-width
  //-     span.text-bold {{$t('Add fragment')}}
  //- //- content find slot
  //- div(v-if="stage === 1 && ctx === 'inEditor'").row.full-width
  //- //- fragment
  //- div(v-if="stage === 2").row.full-width.bg-black
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
      :width="previewWidth" :height="previewHeight")
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
