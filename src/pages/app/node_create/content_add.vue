<template lang="pug">
.row.fit.items-center.content-center.justify-center.bg-grey-2
  //- choose type
  q-dialog(v-model="showChooseType" ref="showChooseType"
    transition-show="slide-up" transition-hide="slide-down")
    div(style=`width: 150px; height: 450px`).row.bg-white
      //- TODO: maybe horizontal orientation??
      div(
        v-for="t in types" :key="t.id" @click="chooseType(t)"
        style=`height: 150px; width: 150px; borderBottom: 1px solid #eee`
        ).row.items-center.justify-center.content-center.hr
        q-icon(:name="t.icon" :color="t.color || 'grey'" size="90px")
        .row.full-width.justify-center
          span.text-black {{ t.label }}
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
  //- TODO: editor quote...
  //- add btn
  q-btn(v-if="showAddBtn" icon="add" outline color="primary" round @click="showChooseType = true" size="lg")
  //- TODO: add label under add btn
  input(type="file" hidden ref="photo"  @change="photoChanged")
  img(v-if="type === 'image' && photoUrl" :src="photoUrl" height="100%")
</template>

<script>
import findVideo from './find_video'
import findImage from './find_image'
import editorQuote from './editorQuote'
export default {
  name: 'contentAdd',
  components: { findVideo, findImage, editorQuote },
  props: {},
  data () {
    return {
      showFindVideo: false,
      showFindImage: false,
      showChooseType: false,
      showEditorQuote: false,
      type: '',
      types: [
        {id: 'image', label: 'Изображение', icon: 'image', color: 'green'},
        {id: 'video', label: 'Видео', icon: 'fab fa-youtube', color: 'red'},
        {id: 'quote', label: 'Цитата', icon: 'format_quote', color: 'grey'},
        // {id: 'vkpost', label: 'Пост ВК', icon: 'menu'}
      ],
      showAddBtn: true,
      photoUrl: null,
      photoFile: null
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
    },
    chooseType (type) {
      this.$log('chooseType', type)
      switch (type.id) {
        case 'image': {
          this.$log('load findImage')
          this.showFindImage = true
          this.$refs.showFindImage.show()
          break
        }
        case 'video': {
          this.$log('load findVideo')
          this.showFindVideo = true
          this.$refs.showFindVideo.show()
          break
        }
        case 'quote': {
          this.$log('load editorQuote')
          this.showEditorQuote = true
          this.$refs.showEditorQuote.show()
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
