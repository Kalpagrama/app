<template lang="pug">
.row.fit.bg-grey-2
  //- choose fragment type
  q-dialog(v-model="showChooseType" ref="showChooseType" position="bottom" transition-show="slide-up" transition-hide="slide-down")
    div(style=`height: 150px`).row.full-width.no-wrap.scroll.bg-white
      div(
        v-for="(t, ti) in types" :key="t.id" @click="clickChooseType(t, ti)"
        style=`height: 150px; minWidth: 150px; width: 150px; borderRight: 1px solid #eee`
        ).row.items-center.justify-center.content-center.hr
        q-icon(:name="t.icon" :color="t.color || 'grey'" size="90px")
        .row.full-width.justify-center
          span.text-black {{ t.label }}
  //- find fragment
  q-dialog(ref="showDialog" :maximized="true" transition-show="slide-up" transition-hide="slide-down").fit
    find-video(v-if="showFindVideo" @close="$refs.showDialog.hide(), showFindVideo = false" @videoSelect="videoSelect")
    find-image(v-if="showFindImage" @close="$refs.showDialog.hide(), showFindImage = false" @imageSelect="imageSelect")
    editor-video(
      v-if="showEditorVideo"
      :id="'slkdfslk'" :video="video" :points="relativePoints"
      @done="videoDone")
  //- stage none
  div(v-if="stage === 'none'").row.fit.items-center.justify-center
    q-btn(icon="add" outline color="primary" round @click="showChooseType = true" size="xl")
  //- image preview
  div(v-if="stage === 'ready' && type === 'image'").row.fit
    img(:src="imageUrl" height="100%")
  //- video preview
  div(v-if="type === 'video' && video"
    style=`position: relative`).row.fit
    div(style=`position: absolute; bottom: 0px; height: 50px`
      ).row.full-width.items-center.justify-end.q-px-sm
      //- span.text-white {{ relativePoints }}
      q-btn(round dense color="primary" icon="edit" @click="videoEdit")
    img(:src="video.snippet.thumbnails.high.url" width="100%" height="100%")
</template>

<script>
import findVideo from '../find_video'
import findImage from '../find_image'
import editorVideo from '../editor_video'
export default {
  name: 'fragment',
  components: {findVideo, findImage, editorVideo},
  data () {
    return {
      file: null,
      stage: 'none',
      stages: ['none', 'ready', 'loading'],
      type: null,
      types: [
        // {id: 'image', label: 'Изображение', icon: 'image', color: 'green'},
        {id: 'video', label: 'Видео', icon: 'fab fa-youtube', color: 'red'},
        // {id: 'quote', label: 'Цитата', icon: 'format_quote', color: 'grey'},
        // {id: 'vkpost', label: 'Пост ВК', icon: 'fab fa-vk', color: 'blue'}
      ],
      showChooseType: false,
      showFindVideo: false,
      showFindImage: false,
      showFindAudio: false,
      showEditorQuote: false,
      showEditorVideo: false,
      showEditorImage: false,
      showEditorBook: false,
      showEditorAudio: false,
      image: null,
      imageUrl: '',
      video: null,
      videoUrl: '',
      relativePoints: [],
      relativeScale: 1000
    }
  },
  methods: {
    uploadContent () {
      return new Promise(async (resolve, reject) => {
        try {
          this.$log('uploadContent start', this.video.id.videoId)
          if (this.type === 'video') {
            let { data: { uploadContentUrl: { oid } } } = await this.$apollo.mutate({
              mutation: gql`
                mutation uploadContentUrl ($url: String!) {
                  uploadContentUrl(type: VIDEO, url: $url) {
                    oid
                  }
                }`,
              variables: {
                url: `http://www.youtube.com/watch?v=` + this.video.id.videoId
              }
            })
            this.$log('uploadContent oid', oid)
            this.$log('uploadContent done')
            let content = {oid: oid, relativePoints: this.relativePoints, relativeScale: this.relativeScale}
            resolve(content)
          } else {
            this.$log('ONLY VIDEO WORKS!)')
            resolve(null)
          }
        } catch (e) {
          this.$log('uploadContent error', e)
        }
      })
    },
    videoSelect (v) {
      this.$log('videoSelect', v)
      this.stage = 'ready'
      this.$set(this, 'video', v)
    },
    videoEdit () {
      this.$log('videoEdit')
      this.showEditorVideo = true
      this.$refs.showDialog.show()
    },
    videoDone (points) {
      this.$log('videoDone', points)
      this.relativePoints = points
      this.$refs.showDialog.hide()
      this.showEditorVideo = false
    },
    imageSelect (i) {
      this.$log('imageSelect', i)
      this.stage = 'ready'
      this.$set(this, 'image', i)
    },
    async clickChooseType (t) {
      this.$log('clickChooseType')
      this.$refs.showChooseType.hide()
      await this.$wait(200)
      this.chooseType(t)
      this.type = t.id
    },
    chooseType (type) {
      this.$log('chooseType', type)
      switch (type.id) {
        case 'image': {
          this.$log('load findImage')
          this.showFindImage = true
          this.$refs.showDialog.show()
          break
        }
        case 'video': {
          this.$log('load findVideo')
          this.showFindVideo = true
          // this.$refs.showFindVideo.show()
          // this.showEditorVideo = true
          this.$refs.showDialog.show()
          break
        }
        case 'quote': {
          this.$log('load editorQuote')
          this.showEditorQuote = true
          this.$refs.showDialog.show()
          break
        }
      }
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
