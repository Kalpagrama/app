<style lang="stylus">
</style>
<template lang="pug">
div(
  :style=`{position: 'relative', borderRadius: '10px', overflow: 'hidden'}`
  ).row.full-width.bg-grey-1
  //- stage 0
  div(v-if="stage === 0" :style=`{height: '200px'}`).row.full-width.items-center.justify-center.bg-grey-3
    q-btn(round outline size="lg" color="accent" icon="add" @click="stage = 1")
  //- stage 1
  nc-fragment-content(v-if="stage === 1" @content="contentFound" :width="width")
  //- stage 2
  div(v-if="stage === 2 && content"
    :style=`{position: 'relative'}`).row.full-width
    //- cancel
    k-dialog-bottom(ref="ncFragmentCancelDialog" :options="{actions: {delete: {name: 'Delete', color: 'red'}}}" @action="cancel()")
    q-btn(
      round flat color="white" icon="clear" @click="$refs.ncFragmentCancelDialog.show()"
      :style=`{position: 'absolute', zIndex: 11000, right: '18px', top: '18px'}`).shadow-1
    //- start
    transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
      q-btn(
        v-if="!started"
        push no-caps color="accent" @click="start()"
        :style=`{position: 'absolute', zIndex: 11000, left: '20px', bottom: '34px'}`)
        span.text-bold {{$t('Start')}}
    //- play
    transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
      q-btn(
        v-if="started"
        round push no-caps @click="play()"
        :color="playing ? 'green' : 'green'"
        :icon="playing ? 'edit' : 'check'"
        :style=`{position: 'absolute', zIndex: 11000, right: '20px', bottom: '34px'}`)
    //- preview img
    .row.full-width
      img(:src="content.thumbUrl" :style=`{width: '100%', maxHeight: width+'px', objectFit: 'contain'}` @load="imgLoad")
    //- video
    div(v-if="imgWidth > 0" :style=`{position: 'absolute', zIndex: 100, width: imgWidth+'px', height: imgHeight+'px', top: 0}`).row
      nc-fragment-video(
        v-if="content.type === 'VIDEO'" ref="ncFragmentVideo"
        :content="content" :width="imgWidth" :height="imgHeight")
    //- editors
    nc-fragment-video-editor(
      v-if="$refs.ncFragmentVideo && content.type === 'VIDEO'" ref="ncFragmentVideoEditor"
      :content="content" :player="$refs.ncFragmentVideo.player"
      :width="width" :style=`{height: toolsHeight+'px'}`)
</template>

<script>
import ncFragmentContent from './nc_fragment_content'
import ncFragmentVideo from './nc_fragment_video'
import ncFragmentVideoEditor from './nc_fragment_video_editor'
export default {
  name: 'ncFragment',
  components: {ncFragmentContent, ncFragmentVideo, ncFragmentVideoEditor},
  props: ['width', 'index', 'fragment', 'stageInitial'],
  data () {
    return {
      stage: 0,
      content: null,
      imgWidth: 0,
      imgHeight: 0,
      actionsHeight: 0,
      toolsHeight: 0,
      started: false,
      playing: false,
      points: []
    }
  },
  methods: {
    start () {
      this.$log('start start')
      // this.points.push({name: '', type: 'default', thumbUrl: '', start: this.$refs.ncFragmentVideo.now, end: this.$refs.ncFragmentVideo.now + 3})
      if (!this.started) this.started = true
      this.$emit('edit', this.index)
      this.$tween.to(this, 0.3, {
        actionsHeight: 52,
        toolsHeight: this.$q.screen.height - 8 - 8 - 8 - 60 - this.imgHeight,
        onComplete: () => {
          this.$log('start done')
        }
      })
    },
    play () {
      this.$log('play start')
      if (this.playing) {
        this.playing = false
        this.start()
      } else {
        this.playing = true
        this.$emit('edit', -1)
        this.$tween.to(this, 0.3, {
          actionsHeight: 0,
          toolsHeight: 0
        })
      }
    },
    imgLoad (e) {
      this.$log('imgLoad', e.path[0].width, e.path[0].height)
      this.imgWidth = e.path[0].width
      this.imgHeight = e.path[0].height
    },
    contentFound (content) {
      this.$log('contentFound', content)
      this.content = content
      this.stage = 2
    },
    cancel () {
      this.$log('cancel')
      this.stage = 1
      this.content = null
    }
  },
  mounted () {
    this.$log('mounted')
    // if (this.stageInitial) this.stage = this.stageInitial
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
