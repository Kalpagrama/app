<style lang="stylus">
</style>
<template lang="pug">
div(
  :style=`{position: 'relative', zIndex: 100, borderRadius: '10px', overflow: 'hidden'}`
  ).row.full-width.items-start.content-start.bg-grey-1.kscroll
  //- stage 0
  div(v-if="stage === 0" :style=`{height: '200px'}`).row.full-width.items-center.justify-center.bg-grey-3
    q-btn(round outline size="lg" color="accent" icon="add" @click="stage = 1")
  //- stage 1
  nc-fragment-content(v-if="stage === 1" @content="contentFound" :width="width")
  //- stage 2
  div(v-if="stage === 2" :style=`{position: 'relative'}`).row.full-width.items-start.content-start
    //- cancel
    k-dialog-bottom(ref="ncFragmentCancelDialog" :options="{actions: {delete: {name: 'Delete fragment', color: 'red'}}}" @action="cancel()")
    q-btn(
      round flat color="white" icon="clear" @click="$refs.ncFragmentCancelDialog.show()"
      :style=`{position: 'absolute', zIndex: 11000, right: '18px', top: '18px'}`).shadow-1
    //- play
    transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
      q-btn(
        round push no-caps @click="edit()"
        :color="editing ? 'green' : 'green'"
        :icon="editing ? 'check' : 'edit'"
        :style=`{position: 'absolute', zIndex: 11000, right: '20px', bottom: '34px'}`)
    //- preview img
    img(
      ref="ncFragmentPreview"
      @load="imgLoad"
      :src="node.meta.fragments[index].thumbUrl || node.fragments[index].content.thumbUrl"
      :style=`{width: '100%', maxHeight: width+'px', objectFit: 'contain', userSelect: 'none'}`
      crossOrigin="anonymous" draggable="false")
    //- video
    div(
      v-if="$refs.ncFragmentPreview && imgHeight > 0"
      :style=`{position: 'absolute', zIndex: 100,
        width: $refs.ncFragmentPreview.clientWidth+'px',
        height: $refs.ncFragmentPreview.clientHeight+'px', top: 0}`).row
      nc-fragment-video(
        v-if="node.fragments[index].content.type === 'VIDEO'" ref="ncFragmentVideo"
        :content="node.fragments[index].content" :width="$refs.ncFragmentPreview.clientWidth" :height="$refs.ncFragmentPreview.clientHeight")
    //- editors
    nc-fragment-video-editor(
      v-if="$refs.ncFragmentVideo" ref="ncFragmentVideoEditor"
      :index="index" :node="node"
      :content="node.fragments[index].content" :player="$refs.ncFragmentVideo.player"
      :width="width" :style=`{height: toolsHeight+'px'}`)
    div(v-if="false").row.full-width.bg-red
      small.full-width editign: {{editing}}
</template>

<script>
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
      imgWidth: 0,
      imgHeight: 0,
      actionsHeight: 0,
      toolsHeight: 0,
      editing: false
    }
  },
  watch: {
    node: {
      immediate: true,
      handler (to, from) {
        this.$log('node CHANGED', to)
        if (to.fragments[this.index] && to.fragments[this.index].content) {
          this.stage = 2
        } else {
          if (this.index === 0) this.stage = 0
          else this.stage = 1
        }
      }
    }
  },
  methods: {
    edit () {
      this.$log('edit')
      if (this.editing) {
        this.editing = false
        this.$emit('edit', -1)
        this.$tween.to(this, 0.3, {
          actionsHeight: 0,
          toolsHeight: 0
        })
      } else {
        this.editing = true
        this.$emit('edit', this.index)
        // TODO: for video only
        // this.$refs.ncFragmentVideoEditor.cutCreate()
        this.$tween.to(this, 0.3, {
          actionsHeight: 52,
          toolsHeight: this.$q.screen.height - 8 - 8 - 8 - 60 - this.$refs.ncFragmentPreview.clientHeight,
          onComplete: () => {
            this.$log('start done')
          }
        })
      }
    },
    imgLoad (e) {
      this.$log('imgLoad', e.path[0].width, e.path[0].height)
      this.imgWidth = e.path[0].width
      this.imgHeight = e.path[0].height
    },
    imgError (e) {
      this.$log('imgError', e)
      this.$q.notify('imgError!')
    },
    contentFound (content) {
      this.$log('contentFound', content)
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
      this.$nextTick(() => {
        this.play()
      })
    },
    cancel () {
      this.$log('cancel')
      this.$delete(this.node.fragments, this.index)
      this.$delete(this.node.meta.fragments, this.index)
      this.$set(this, 'stage', 1)
    }
  },
  async mounted () {
    this.$log('mounted')
    if (this.stageInitial) this.stage = this.stageInitial
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
