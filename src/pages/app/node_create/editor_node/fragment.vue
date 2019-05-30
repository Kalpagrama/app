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
  q-dialog(ref="showDialog" :maximized="true" transition-show="slide-up" transition-hide="slide-down")
    find-video(v-if="showFindVideo" @close="$refs.showDialog.hide(), showFindVideo = false")
    find-image(v-if="showFindImage" @close="$refs.showDialog.hide(), showFindImage = false")
  //- stage none
  div(v-if="stage === 'none'").row.fit.items-center.justify-center
    q-btn(icon="add" outline color="primary" round @click="showChooseType = true" size="xl")
  div(v-if="stage === 'ready' && type === 'image'").row.fit
    img(:src="imageUrl" height="100%")
</template>

<script>
import findVideo from '../find_video'
import findImage from '../find_image'
export default {
  name: 'fragment',
  components: {findVideo, findImage},
  data () {
    return {
      file: null,
      stage: 'none',
      stages: ['none', 'ready', 'loading'],
      type: null,
      types: [
        {id: 'image', label: 'Изображение', icon: 'image', color: 'green'},
        {id: 'video', label: 'Видео', icon: 'fab fa-youtube', color: 'red'},
        {id: 'quote', label: 'Цитата', icon: 'format_quote', color: 'grey'},
        {id: 'vkpost', label: 'Пост ВК', icon: 'fab fa-vk', color: 'blue'}
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
      imageUrl: ''
    }
  },
  methods: {
    async clickChooseType (t) {
      this.$log('clickChooseType')
      this.$refs.showChooseType.hide()
      await this.$wait(200)
      this.chooseType(t)
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
