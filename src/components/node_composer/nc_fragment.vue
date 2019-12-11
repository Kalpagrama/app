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
      :src="node.fragments[index].content.thumbUrl"
      :style=`{position: previewLoaded ? 'absolute' : 'relative', top: 0, width: '100%', maxHeight: width+'px', objectFit: 'contain', userSelect: 'none'}`
      crossOrigin="anonymous" draggable="false")
    //- video
    div(
      v-if="previewLoaded"
      :style=`{position: 'relative', zIndex: 100, top: 0}`).row.fit
      nc-fragment-video(
        v-if="node.fragments[index].content.type === 'VIDEO'" ref="ncFragmentVideo"
        :content="node.fragments[index].content" :width="previewWidth" :height="previewHeight")
        template(v-slot:editor=`{now, player}`)
          nc-fragment-video-editor(
            v-if="$refs.ncFragmentVideo" ref="ncFragmentVideoEditor"
            @close="editing = false"
            :index="index" :node="node"
            :content="node.fragments[index].content" :now="now" :player="player"
            :width="width" :style=`{height: toolsHeight+'px'}`)
</template>

<script>
// TODO: when content.contentType === KALPA do not use thumbUrl and url in fragments...
import ncFragmentContent from './nc_fragment_content'
import ncFragmentVideo from './nc_fragment_video'
import ncFragmentVideoEditor from './nc_fragment_video_editor'

export default {
  name: 'ncFragment',
  components: {ncFragmentContent, ncFragmentVideo, ncFragmentVideoEditor},
  props: ['width', 'index', 'node', 'stageInitial'],
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
    ncFragmentPreview () {
      if (this.$refs.ncFragmentPreview) return this.$refs.ncFragmentPreview
      else return null
    }
  },
  watch: {
    '$refs.ncFragmentPreview': {
      handler (to, from) {
        this.$log('$refs.ncFragmentPreview CHANGED', to)
      }
    },
    stage: {
      immediate: false,
      handler (to, from) {
        this.$log('f:', this.index, 'stage CHANGED', to)
        if (to === 2) {
          this.previewInterval = setInterval(this.previewCheck, 100)
        }
      }
    },
    node: {
      immediate: true,
      handler (to, from) {
        this.$log('f:', this.index, ' node CHANGED', to)
        if (to.fragments[this.index] && to.fragments[this.index].content) {
          this.$log('f:', this.index, 'GOT FRAGMENT', 'stage', this.stage)
          this.stage = 2
          this.$log('f:', this.index, 'stage', this.stage)
        } else {
          this.$log('f:', this.index, 'NO FRAGMENT')
          // if (this.index === 0) this.stage = 1
          // else this.stage = 0
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
      switch (this.node.fragments[this.index].content.type) {
        case 'VIDEO': {
          this.$refs.ncFragmentVideoEditor.boom()
          break
        }
      }
    },
    previewLoad (e) {
      this.$log('f:', this.index, 'previewLoad', e.path[0].width, e.path[0].height)
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
      // TODO: take relativeCuts from the node...
      this.$set(this.node.fragments, this.index, fragment)
      this.$set(this.node.meta.fragments, this.index, {
        relativeCuts: [],
        thumbUrl: ''
      })
      this.$set(this, 'stage', 2)
      this.$emit('ready', this.index)
    },
    contentFound (content) {
      this.$log('f:', this.index, 'contentFound', content)
      this.$set(this.node.fragments, this.index, {
        relativePoints: [],
        relativeScale: content.type === 'VIDEO' ? content.duration : 0,
        content: content,
        oid: content.oid
      })
      this.$set(this.node.meta.fragments, this.index, {
        relativeCuts: [],
        thumbUrl: ''
      })
      this.$set(this, 'stage', 2)
      this.$emit('ready', this.index)
    },
    cancel () {
      this.$log('cancel')
      this.$delete(this.node.fragments, this.index)
      this.$delete(this.node.meta.fragments, this.index)
      this.$set(this, 'stage', 1)
    }
  },
  async mounted () {
    this.$log('f:', this.index, 'mounted')
  },
  beforeDestroy () {
    this.$log('f:', this.index, 'beforeDestroy')
    clearInterval(this.previewInterval)
  }
}
</script>
