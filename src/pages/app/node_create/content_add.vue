<template lang="pug">
.row.fit.items-center.content-center.justify-center.bg-grey-2
  //- choose type
  q-dialog(v-model="showChooseType" ref="showChooseType"
    transition-show="slide-up" transition-hide="slide-down")
    div(style=`width: 200px; height: 600px`).row.bg-white
      div(
        v-for="t in types" :key="t.id"
        style=`height: 200px; width: 200px; borderBottom: 1px solid #eee`
        ).row.items-center.justify-center.content-center.hr
        q-icon(:name="t.icon" color="red" size="90px")
        .row.full-width.justify-center
          span.text-black {{ t.label }}
  //- finders
  q-dialog(v-model="showFindYoutube" ref="showFindYoutube" :maximized="true"
    transition-show="slide-up" transition-hide="slide-down")
    find-youtube(v-if="showFindYoutube" @close="$refs.showFindYoutube.hide()")
  //- TODO: editors
  //- add btn
  q-btn(v-if="showAddBtn" icon="add" outline color="primary" round @click="chooseType" size="lg")
  //- TODO: add label under add btn
  input(type="file" hidden ref="photo"  @change="photoChanged")
  img(v-if="type === 'image' && photoUrl" :src="photoUrl" height="100%")
</template>

<script>
import findYoutube from './find_youtube'
export default {
  name: 'contentAdd',
  components: {findYoutube},
  props: {},
  data () {
    return {
      showFindYoutube: false,
      showChooseType: false,
      type: '',
      types: [
        {id: 'image', label: 'Изображение', icon: 'image', color: 'green'},
        {id: 'video', label: 'Видео', icon: 'fab fa-youtube', color: 'red'},
        {id: 'quote', label: 'Цитатка', icon: 'format_quote', color: 'grey'},
        // {id: 'vkpost', label: 'Пост ВК', icon: 'menu'}
      ],
      typeImage: '',
      typesImage: [
        {id: 'device', label: 'С устройства', icon: 'image'},
        {id: 'google', label: 'Из Google', icon: 'fab fa-google'},
        {id: 'pinterest', label: 'Из Pinterest', icon: 'fab fa-pinterest'}
      ],
      typeVideo: '',
      typesVideo: [
        {id: 'device', label: 'С устройства', icon: 'videocam'},
        {id: 'youtube', label: 'Из YouTube', icon: 'fab fa-youtube'},
        {id: 'vk', label: 'Из Вконтакте', icon: 'fab fa-vk'}
      ],
      state: 'empty',
      states: [],
      showAddBtn: true,
      photoUrl: null,
      photoFile: null
    }
  },
  apollo: {
    $client: 'upload'
  },
  methods: {
    chooseType () {
      this.$log('chooseType')
      this.showChooseType = true
      // this.$q
      //   .bottomSheet({message: 'Выберите тип контента', actions: this.types})
      //   .onOk(action => {
      //     this.$log('Type:', action.id)
      //     this.$set(this, 'type', 'none')
      //     this.$set(this, 'type', action.id)
      //   })
    },
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
  watch: {
    type: {
      handler (to, from) {
        switch (to) {
          case 'image': {
            this.$log('load image editor')
            // choose image source
            this.$q
              .bottomSheet({message: 'Где будем брать фотку', actions: this.typesImage})
              .onOk(action => {
                this.$set(this, 'typeImage', action.id)
                if (action.id === 'device') {
                  this.$log('image from DEVICE')
                  this.$refs.photo.click()
                } else if (action.id === 'google') {
                  this.$log('image from GOOGLE')
                } else if (action.id === 'pinterest') {
                  this.$log('image from PINTEREST')
                }
              })
            break
          }
          case 'video': {
            this.$log('load video editor')
            this.$q
              .bottomSheet({message: 'Где будем брать видео', actions: this.typesVideo})
              .onOk(action => {
                this.$set(this, 'typeVideo', action.id)
                if (action.id === 'device') {
                  this.$log('video from DEVICE')
                } else if (action.id === 'youtube') {
                  this.$log('video from YOUTUBE')
                  this.$set(this, 'showFindYoutube', true)
                } else if (action.id === 'vk') {
                  this.$log('video from VK')
                }
              })
            break
          }
          case 'quote': {
            this.$log('load quote editor')
            break
          }
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
