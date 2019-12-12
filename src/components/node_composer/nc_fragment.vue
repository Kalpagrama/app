<style lang="stylus">
.mejs__overlay-button {
  display: none !important;
}
</style>
<template lang="pug">
div(
  :style=`{position: 'relative', zIndex: 100, borderRadius: '10px', overflow: 'hidden'}`
  ).row.full-width.items-start.content-start.bg-grey-1
  k-dialog-bottom(ref="ncFragmentCancelDialog" :options="{actions: {delete: {name: 'Delete fragment', color: 'red'}}}" @action="cancel()")
  //- stage 0
  div(v-if="stage === 0" :style=`{height: '200px'}`).row.full-width.items-center.justify-center.bg-grey-3
    q-btn(round outline size="lg" color="accent" icon="add" @click="stage = 1")
  //- stage 1
  nc-fragment-content(v-if="stage === 1" :width="width" @content="contentFound" @fragment="fragmentFound")
  //- stage 2
  div(v-if="stage === 2" :style=`{position: 'relative'}`).row.full-width.items-start.content-start
    //- cancel
    q-btn(
      round flat color="white" icon="clear" @click="$refs.ncFragmentCancelDialog.show()"
      :style=`{position: 'absolute', zIndex: 11000, left: '18px', top: '18px'}`).shadow-1
    //- boom
    q-btn(
      v-if="!boomed"
      push round no-caps @click="boom()"
      color="green"
      :style=`{position: 'absolute', zIndex: 200, bottom: '40px', left: 'calc(50% - 20px)'}`).shadow-5.q-mr-sm
      q-icon(name="wb_incandescent").rotate-180
    //- edit
    q-btn(
      v-if="true"
      push round no-caps @click="editing = !editing"
      :color="editing ? 'green' : 'green'"
      :icon="editing ? 'check' : 'edit'"
      :style=`{position: 'absolute', zIndex: 200, bottom: '40px', right: '20px'}`).shadow-5
    //- preview img, node.meta.fragments[index].thumbUrl
    //- node.fragments[index].content.contentSource === 'KALPA' ? node.meta.fragments[index].thumbUrl :
    img(
      ref="ncFragmentPreview"
      @load="previewLoad"
      :src="thumbUrl || fragment.content.thumbUrl"
      :style=`{position: previewLoaded ? 'absolute' : 'relative', top: 0, width: '100%', maxHeight: width+'px', objectFit: 'contain', userSelect: 'none'}`
      crossOrigin="anonymous" draggable="false")
    //- video
    div(
      v-if="previewLoaded"
      :style=`{position: 'relative', zIndex: 100, top: 0}`).row.fit
      nc-fragment-video(
        v-if="fragment.content.type === 'VIDEO'" ref="ncFragmentVideo"
        :fragment="fragment" :inEditor="inEditor"
        :width="previewWidth" :height="previewHeight")
        template(v-if="inEditor" v-slot:editor=`{now, player}`)
          nc-fragment-video-editor(
            v-if="$refs.ncFragmentVideo" ref="ncFragmentVideoEditor"
            @close="editing = false"
            :fragment="fragment" :now="now" :player="player"
            :width="previewWidth" :height="previewHeight"
            :style=`{height: toolsHeight+'px'}`)
</template>

<script>
// TODO: when content.contentType === KALPA do not use thumbUrl and url in fragments...
import ncFragmentContent from './nc_fragment_content'
import ncFragmentVideo from './nc_fragment_video'
import ncFragmentVideoEditor from './nc_fragment_video_editor'

export default {
  name: 'ncFragment',
  components: {ncFragmentContent, ncFragmentVideo, ncFragmentVideoEditor},
  props: ['width', 'thumbUrl', 'fragment', 'inEditor', 'stageFirst'],
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
  watch: {
    stage: {
      immediate: false,
      handler (to, from) {
        this.$log('f:', this.index, 'stage CHANGED', to)
        if (to === 2) {
          this.previewInterval = setInterval(this.previewCheck, 100)
        }
      }
    },
    fragment: {
      immediate: true,
      handler (to, from) {
        this.$log('fragment CHANGED', to)
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
          this.stage = 0
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
    boom () {
      this.$log('boom')
      this.boomed = true
      this.editing = true
      switch (this.fragment.content.type) {
        case 'VIDEO': {
          this.$refs.ncFragmentVideoEditor.boom()
          break
        }
      }
    },
    previewLoad (e) {
      this.$log('previewLoad', e.path[0].width, e.path[0].height)
    },
    previewError (e) {
      this.$log('previewError', e)
      this.$q.notify('previewError!')
    },
    previewCheck () {
      // this.$log('ncFragmentPreview', this.$refs.ncFragmentPreview)
      if (this.$refs.ncFragmentPreview) {
        let complete = this.$refs.ncFragmentPreview.complete
        this.$log('complete', complete)
        if (complete) {
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
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    clearInterval(this.previewInterval)
  }
}
</script>
