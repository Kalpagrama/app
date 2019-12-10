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
      :style=`{position: 'absolute', zIndex: 11000, right: '18px', top: '18px'}`).shadow-1
    //- edit
    transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
      q-btn(
        round push no-caps @click="edit()"
        :color="editing ? 'green' : 'green'"
        :icon="editing ? 'check' : 'edit'"
        :style=`{position: 'absolute', zIndex: 500, right: '20px', bottom: '40px'}`)
    //- preview img, node.meta.fragments[index].thumbUrl
    //- node.fragments[index].content.contentSource === 'KALPA' ? node.meta.fragments[index].thumbUrl :
    img(
      ref="ncFragmentPreview"
      @load="imgLoad"
      :src="node.fragments[index].content.thumbUrl"
      :style=`{position: 'absolute', top: 0, width: '100%', maxHeight: width+'px', objectFit: 'contain', userSelect: 'none'}`
      crossOrigin="anonymous" draggable="false")
    //- video
    div(
      v-if="imgHeight > 0"
      :style=`{position: 'relative', zIndex: 100, top: 0}`).row.full-width
      nc-fragment-video(
        v-if="node.fragments[index].content.type === 'VIDEO'" ref="ncFragmentVideo"
        :content="node.fragments[index].content" :width="imgWidth" :height="imgHeight")
        template(v-slot:editor=`{now, player}`)
          nc-fragment-video-editor(
            v-if="$refs.ncFragmentVideo" ref="ncFragmentVideoEditor"
            @cutTimer="edit(), $refs.ncFragmentVideoEditor.cutTimer()"
            :index="index" :node="node"
            :content="node.fragments[index].content" :player="$refs.ncFragmentVideo.player"
            :width="width" :style=`{height: toolsHeight+'px'}`)
    div(v-if="false" :style=`{height: '60px',zIndex: 10000}`).row.full-width.bg-red
      small.full-width editing: {{editing}}
      small.full-width imgHeight: {{imgHeight}}
      small.full-width imgWidth: {{imgWidth}}
      small.full-width height: {{node.fragments[index].content.height}}
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
      imgWidth: 0,
      imgHeight: 0,
      imgReady: false,
      imgInterval: null,
      actionsHeight: 0,
      toolsHeight: 0,
      editing: false,
      now: 0
    }
  },
  watch: {
    stage: {
      immediate: true,
      handler (to, from) {
        this.$log('f:', this.index, 'stage CHANGED', to)
        if (to === 2) {
          this.imgInterval = setInterval(this.imgCheck, 100)
        }
      }
    },
    node: {
      immediate: true,
      handler (to, from) {
        this.$log('f:', this.index, ' node CHANGED', to)
        if (to.fragments[this.index] && to.fragments[this.index].content) {
          this.$log('f:', this.index, 'GOT FRAGMENT', 'stage', this.stage)
          this.$set(this, 'stage', 2)
          // this.stage = 2
          this.$log('f:', this.index, 'stage', this.stage)
          // this.edit()
        } else {
          this.$log('f:', this.index, 'NO FRAGMENT')
          if (this.index === 0) this.stage = 0
          else this.stage = 1
        }
      }
    }
  },
  methods: {
    edit () {
      this.$log('f:', this.index, 'edit', this.editing)
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
      this.$log('f:', this.index, 'imgLoad', e.path[0].width, e.path[0].height)
      // this.$set(this, 'imgWidth', e.path[0].width)
      // this.$set(this, 'imgHeight', e.path[0].height)
      // this.imgWidth = e.path[0].width
      // this.imgHeight = e.path[0].height
    },
    imgError (e) {
      this.$log('imgError', e)
      this.$q.notify('imgError!')
    },
    imgCheck () {
      // this.$log('ncFragmentPreview', this.$refs.ncFragmentPreview)
      if (this.$refs.ncFragmentPreview) {
        let height = this.$refs.ncFragmentPreview.clientHeight
        let width = this.$refs.ncFragmentPreview.clientWidth
        this.$log('height', height)
        if (height > 0) {
          this.imgHeight = height
          this.imgWidth = width
          this.imgReady = true
          clearInterval(this.imgInterval)
        }
      }
    },
    fragmentFound (fragment) {
      this.$log('fragmentFound', fragment)
      this.$set(this.node.fragments, this.index, fragment)
      this.$set(this.node.meta.fragments, this.index, {
        relativeCuts: [],
        thumbUrl: ''
      })
      this.$set(this, 'stage', 2)
      this.$emit('ready', this.index)
      // this.$nextTick(() => {
      //   this.edit()
      // })
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
      // this.$nextTick(() => {
      //   this.edit()
      // })
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
    clearInterval(this.imgInterval)
  }
}
</script>
