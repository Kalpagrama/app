<style lang="stylus">
.mejs__overlay-button {
  display: none !important;
}
</style>
<template lang="pug">
div(
  :style=`{position: 'relative', zIndex: 100, borderRadius: '10px', overflow: 'hidden'}`
  ).row.full-width.items-start.content-start.bg-grey-1
  //- stage 0
  div(v-if="ctx === 'inEditor' && stage === 0" @click="stage = 1").row.full-width.items-center.justify-center.bg-grey-1
    q-btn(
      outline no-caps color="green" icon="add" @click="stage = 1"
      :style=`{height: '60px', borderRadius: '10px'}`).full-width
      span.text-bold {{$t('Add fragment')}}
  //- stage 1
  nc-fragment-content(v-if="ctx === 'inEditor' && stage === 1" @content="$emit('content', $event)" @fragment="$emit('fragment', $event)")
  //- stage 2
  div(
    v-if="stage === 2"
    :style=`{position: 'relative', maxHeight: ctx === 'inEditor' ? previewHeight+'px' : '100%'}`
    :class=`{'full-height': !mini}`).row.full-width.items-start.content-start.bg-black
    k-dialog-bottom(
      v-if="ctx === 'inEditor'"
      ref="ncFragmentCancelDialog" :options="{actions: {delete: {name: 'Delete fragment', color: 'red'}}}" @action="$emit('delete')")
    //- previewLoaded
    //- span(:style=`{position: 'absolute', zIndex: 10000, left: '50%', top: '50%'}`).bg-red.text-white.q-pa-sm previewLoaded: {{previewLoaded}}
    //- mini mode toggle tint
    div(
      v-if="mini" @click="$emit('mini')"
      :style=`{position: 'absolute', zIndex: 200, opacity: 0.5}`).row.fit.cursor-pointer
    //- actions
    q-btn(
      v-if="!mini && visible && ctx !== 'inEditor'"
      round flat color="white" icon="more_vert" @click="$emit('action')"
      :style=`{position: 'absolute', zIndex: 200, right: '8px', top: '8px', background: 'rgba(255,255,255,0.15)'}`).shadow-5
    //- cancel
    q-btn(
      v-if="ctx === 'inEditor'"
      round flat color="red" icon="clear" @click="$refs.ncFragmentCancelDialog.show()"
      :style=`{position: 'absolute', zIndex: 11000, left: '10px', top: 'calc(50% - 20px)', background: 'rgba(255,255,255,0.15)'}`).shadow-5
    //- edit
    q-btn(
      v-if="ctx === 'inEditor'"
      push round no-caps @click="editing = !editing"
      :color="editing ? 'green' : 'green'"
      :icon="editing ? 'check' : 'edit'"
      :style=`{position: 'absolute', zIndex: 200, bottom: '24px', right: '16px'}`).shadow-5
    //- preview
    img(
      ref="ncFragmentPreview"
      :src="ctx === 'inEditor' ? fragment.content.thumbUrl : thumbUrl"
      @load="previewLoad" @error="previewError"
      crossOrigin="anonymous" draggable="false"
      :style=`{width: '100%', minWidth: '100%', maxHeight: $q.screen.height+'px', objectFit: 'contain', userSelect: 'none'}`
      :class=`{'full-height': ctx !== 'inEditor'}`)
    //- video
    div(
      v-if="previewLoaded"
      :style=`{position: 'absolute', zIndex: 100, top: 0, bottom: 0, left: 0, right: 0, minHeight: '100%', minWidth: '100%'}`).row.fit
      nc-fragment-video(
        v-if="previewLoaded && fragment && fragment.content.type === 'VIDEO'" ref="ncFragmentVideo"
        :ctx="ctx" :fragment="fragment" :inEditor="inEditor" :mini="mini" :visible="visible"
        :width="previewWidth" :height="previewHeight"
        @muted="$event => $emit('muted', $event)"
        @ended="$emit('ended', index)")
    //- editors
  div(v-if="stage === 2 && ctx === 'inEditor'").row.full-width
    nc-fragment-video-editor(
      v-if="$refs.ncFragmentVideo" ref="ncFragmentVideoEditor"
      @close="editing = false"
      :fragment="fragment" :now="$refs.ncFragmentVideo.now" :player="$refs.ncFragmentVideo.player"
      :width="previewWidth" :height="toolsHeight"
      :style=`{height: toolsHeight+'px'}`)
</template>

<script>
import ncFragmentContent from './nc_fragment_content'
import ncFragmentVideo from './nc_fragment_video'
import ncFragmentVideoEditor from './nc_fragment_video_editor'

export default {
  name: 'ncFragment',
  components: {ncFragmentContent, ncFragmentVideo, ncFragmentVideoEditor},
  props: ['ctx', 'index', 'thumbUrl', 'fragment', 'inEditor', 'stageFirst', 'mini', 'visible'],
  data () {
    return {
      stage: 0,
      previewWidth: 0,
      previewHeight: 0,
      previewLoaded: false,
      actionsHeight: 0,
      toolsHeight: 0,
      editing: false,
      contentReady: false,
      editorReady: false
    }
  },
  computed: {
  },
  watch: {
    fragment: {
      immediate: true,
      handler (to, from) {
        this.$log('fragment CHANGED', to)
        if (this.ctx === 'inEditor') {
          if (to) {
            if (to.content) {
              this.$log('GOT CONTENT')
              this.stage = 2
            } else {
              this.$log('NO CONTENT')
              this.stage = this.stageFirst || 1
            }
          } else {
            this.$log('NO FRAGMENT')
            this.stage = this.stageFirst || 0
            this.previewLoaded = false
            this.previewWidth = 0
            this.previewHeight = 0
            this.contentReady = false
            this.editorReady = false
            this.editing = false
          }
        } else {
          this.stage = 2
        }
      }
    },
    editing: {
      handler (to, from) {
        this.$log('editing CHANGED', to)
        if (to) {
          this.$emit('edit', this.index)
          this.$tween.to(this, 0.3, {
            actionsHeight: 52,
            toolsHeight: this.$q.screen.height - 8 - 8 - 8 - 60 - this.$refs.ncFragmentPreview.clientHeight,
            onComplete: () => {
              this.$log('edit START')
            }
          })
        } else {
          this.$emit('edit', -1)
          this.$tween.to(this, 0.3, {
            actionsHeight: 0,
            toolsHeight: 0,
            onComplete: () => {
              this.$log('edit END')
            }
          })
        }
      }
    }
  },
  methods: {
    play () {
      this.$log('play')
      if (this.fragment && this.fragment.content) {
        switch (this.fragment.content.type) {
          case 'VIDEO': {
            if (this.$refs.ncFragmentVideo) this.$refs.ncFragmentVideo.play()
            break
          }
        }
      }
    },
    pause () {
      this.$log('pause')
      if (this.fragment && this.fragment.content) {
        switch (this.fragment.content.type) {
          case 'VIDEO': {
            if (this.$refs.ncFragmentVideo) this.$refs.ncFragmentVideo.pause()
          }
        }
      }
    },
    async previewLoad () {
      this.$log('previewLoad', this.$refs.ncFragmentPreview.clientHeight)
      if (this.ctx === 'inEditor') this.$q.notify('previewLoad' + this.$refs.ncFragmentPreview.clientHeight)
      let h = this.$refs.ncFragmentPreview.clientHeight
      let w = this.$refs.ncFragmentPreview.clientWidth
      this.$emit('previewHeight', h)
      this.$emit('previewWidth', w)
      this.previewHeight = h
      this.previewWidth = w
      this.previewLoaded = true
    },
    previewError (e) {
      this.$log('previewError', e)
      this.$q.notify('previewError!')
    }
  }
}
</script>
