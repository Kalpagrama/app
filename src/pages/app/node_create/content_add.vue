<template lang="pug">
.row.fit.items-center.content-center.justify-center.bg-grey-2
  //- finders
  //- find video
  q-dialog(ref="showFindVideo" :maximized="true"
    transition-show="slide-up" transition-hide="slide-down")
    find-video(v-if="showFindVideo" @close="$refs.showFindVideo.hide()")
  //- find image
  q-dialog(ref="showFindImage" :maximized="true"
    transition-show="slide-up" transition-hide="slide-down")
    find-image(v-if="showFindImage" @close="$refs.showFindImage.hide()")
  //- editors
  //- editor quote
  q-dialog(ref="showEditorQuote" :maximized="true"
    transition-show="slide-up" transition-hide="slide-down")
    editor-quote(v-if="showEditorQuote" @close="$refs.showEditorQuote.hide()")
  q-dialog(ref="showEditorVideo" :maximized="true"
    transition-show="slide-up" transition-hide="slide-down")
    editor-video(v-if="showEditorVideo" @close="$refs.showEditorVideo.hide()")
  //- TODO: editor quote...
  //- add btn
  q-btn(v-if="showAddBtn" icon="add" outline color="primary" round @click="showChooseType = true" size="xl")
  //- TODO: add label under add btn
  input(type="file" hidden ref="photo"  @change="photoChanged")
</template>

<script>
import findVideo from './find_video'
import findImage from './find_image'
import editorQuote from './editor_quote'
import editorVideo from './editor_video'
// TODO: editors of vk image
export default {
  name: 'contentAdd',
  components: { findVideo, findImage, editorQuote, editorVideo },
  props: {},
  data () {
    return {
      showFindVideo: false,
      showFindImage: false,
      showChooseType: false,
      showEditorQuote: false,
      showEditorVideo: false,
      type: '',
      types: [
        {id: 'image', label: 'Изображение', icon: 'image', color: 'green'},
        {id: 'video', label: 'Видео', icon: 'fab fa-youtube', color: 'red'},
        {id: 'quote', label: 'Цитата', icon: 'format_quote', color: 'grey'},
        {id: 'vkpost', label: 'Пост ВК', icon: 'fab fa-vk', color: 'blue'}
      ],
      showAddBtn: true,
      photoUrl: null,
      photoFile: null,
      player: null
    }
  },
  apollo: {
    $client: 'upload'
  },
  methods: {
    photoChanged (e) {
      this.$log('photoChanged', e)
      this.photoFile = e.target.files[0]
      this.showAddBtn = false
      this.photoUrl = URL.createObjectURL(this.photoFile)
    },
    async photoUpload () {
      return new Promise(async (resolve, reject) => {
        try {
          this.$log('photoUpload start')
          let res = await this.$apollo.mutate({
            mutation: gql`
              mutation uploadContentFile ($file: Upload!) {
                # impersonate(login: "4321ip@mail.ru")
                uploadContentFile(file: $file) {
                  name
                  oid
                }
              }`,
            variables: {
              file: this.photoFile
            }
          })
          this.$log('res', res)
          this.$log('photoUpload done')
          resolve(res.data.uploadContentFile)
        } catch (e) {
          this.$log('photoUpload error', e)
          reject(e)
        }
      })
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
