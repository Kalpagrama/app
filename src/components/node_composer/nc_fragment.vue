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
  nc-fragment-content(v-if="ctx === 'inEditor' && stage === 1" :width="width" @content="contentFound" @fragment="fragmentFound")
  //- stage 2
  div(v-if="stage === 2" :style=`{position: 'relative'}`).row.full-width.full-height.items-start.content-start.bg-black
    k-dialog-bottom(ref="ncFragmentCancelDialog" :options="{actions: {delete: {name: 'Delete fragment', color: 'red'}}}" @action="cancel()")
    //- mini mode
    div(
      v-if="mini" @click="$emit('mini')"
      :style=`{position: 'absolute', zIndex: 200, opacity: 0.5}`).row.fit.cursor-pointer
    //- actions
    q-btn(
      v-if="!mini && visible"
      round flat dense color="white" icon="more_vert" @click="fragmentAction()"
      :style=`{position: 'absolute', zIndex: 200, right: '8px', top: '8px', background: 'rgba(255,255,255,0.1)'}`).shadow-1
    //- cancel
    q-btn(
      v-if="ctx === 'inEditor'"
      round flat color="red" icon="clear" @click="$refs.ncFragmentCancelDialog.show()"
      :style=`{position: 'absolute', zIndex: 11000, left: '10px', top: 'calc(50% - 20px)', background: 'rgba(255,255,255,0.1)'}`).shadow-1
    //- boom
    q-btn(
      v-if="ctx === 'inEditor' && !boomed && fragment.cuts.length === 0"
      push round no-caps @click="boom()"
      color="green"
      :style=`{position: 'absolute', zIndex: 200, bottom: '24px', left: 'calc(50% - 20px)'}`).shadow-5.q-mr-sm
      q-icon(name="wb_incandescent").rotate-180
    //- edit
    q-btn(
      v-if="ctx === 'inEditor'"
      push round no-caps @click="editing = !editing"
      :color="editing ? 'green' : 'green'"
      :icon="editing ? 'check' : 'edit'"
      :style=`{position: 'absolute', zIndex: 200, bottom: '24px', right: '16px'}`).shadow-5
    img(
      ref="ncFragmentPreview"
      :src="ctx === 'inEditor' ? fragment.content.thumbUrl : thumbUrl"
      @load="$emit('height', $refs.ncFragmentPreview.clientHeight), previewLoaded = true"
      crossOrigin="anonymous" draggable="false"
      :style=`{position: 'relative', top: 0, width: '100%', minWidth: '100%', height: '100%', minHeight: '100%', objectFit: 'contain', userSelect: 'none'}`
      )
    //- video maxHeight: previewHeight+'px', minHeight: mini ? '0px' : '200px',
    div(
      v-if="fragment && fragment.content && previewLoaded"
      :style=`{position: 'absolute', zIndex: 100, top: 0, minHeight: '100%', minWidth: '100%'}`).fit
      nc-fragment-video(
        v-if="previewLoaded && fragment.content.type === 'VIDEO'" ref="ncFragmentVideo"
        :ctx="ctx" :fragment="fragment" :inEditor="inEditor" :mini="mini" :visible="visible"
        :width="previewWidth" :height="previewHeight"
        @muted="$event => $emit('muted', $event)"
        @ended="$emit('ended', index)")
    nc-fragment-video-editor(
      v-if="ctx === 'inEditor' && $refs.ncFragmentVideo" ref="ncFragmentVideoEditor"
      @close="editing = false"
      :fragment="fragment" :now="$refs.ncFragmentVideo.now" :player="$refs.ncFragmentVideo.player"
      :width="width" :height="previewHeight"
      :style=`{height: toolsHeight+'px'}`)
</template>

<script>
import ncFragmentContent from './nc_fragment_content'
import ncFragmentVideo from './nc_fragment_video'
import ncFragmentVideoEditor from './nc_fragment_video_editor'

export default {
  name: 'ncFragment',
  components: {ncFragmentContent, ncFragmentVideo, ncFragmentVideoEditor},
  props: ['ctx', 'index', 'width', 'thumbUrl', 'fragment', 'inEditor', 'stageFirst', 'mini', 'visible'],
  data () {
    return {
      stage: 0,
      previewWidth: 0,
      previewHeight: 0,
      previewLoaded: false,
      previewInterval: null,
      actionsHeight: 0,
      toolsHeight: 0,
      editing: false,
      boomed: false
    }
  },
  computed: {
  },
  watch: {
    previewLoaded: {
      handler (to, from) {
        if (to) this.$emit('previewLoaded', this.previewHeight)
      }
    },
    stage: {
      immediate: false,
      handler (to, from) {
        this.$log('f:', this.index, 'stage CHANGED', to)
        if (to === 2) {
          // this.previewInterval = setInterval(this.previewCheck, 300)
        }
      }
    },
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
          this.boomed = true
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
    fragmentAction () {
      this.$log('fragmentAction')
      this.$emit('action')
      // this.$store.commit('node/stateSet', ['nodeOptionsPayload', JSON.parse(JSON.stringify(this.fragment))])
      // this.$store.commit('node/stateSet', ['nodeOptionsDialogOpened', true])
    },
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
    boom () {
      this.$log('boom')
      this.boomed = true
      this.editing = true
      switch (this.fragment.content.type) {
        case 'VIDEO': {
          this.$nextTick(() => {
            this.$refs.ncFragmentVideoEditor.boom()
          })
          break
        }
      }
    },
    setSize (...args) {
      this.$refs.ncFragmentVideo.setSize(...args)
    },
    previewHeightLoaded (height) {
      this.$log('previewHeightLoaded', height)
      this.$emit('height', height)
      this.previewHeight = height
      this.previewLoaded = true
    },
    previewError (e) {
      this.$log('previewError', e)
      this.$q.notify('previewError!')
    },
    async previewCheck () {
      this.$log('previewCheck')
      if (this.$refs.ncFragmentPreview) {
        let complete = this.$refs.ncFragmentPreview.complete
        this.$log('complete', complete)
        if (complete) {
          this.$log('complete DONE')
          this.previewHeight = this.$refs.ncFragmentPreview.clientHeight
          this.previewWidth = this.$refs.ncFragmentPreview.clientWidth
          this.previewLoaded = true
          clearInterval(this.previewInterval)
        }
      }
    },
    fragmentFound (fragment) {
      this.$log('fragmentFound', fragment)
      this.$emit('fragment', fragment)
    },
    contentFound (content) {
      this.$log('contentFound', content)
      this.$emit('content', content)
    },
    cancel () {
      this.$log('cancel')
      this.$emit('delete')
    }
  },
  async mounted () {
    // this.$log('mounted')
  },
  beforeDestroy () {
    // this.$log('beforeDestroy')
    clearInterval(this.previewInterval)
  }
}
</script>
