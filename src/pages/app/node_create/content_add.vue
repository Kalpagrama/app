<template lang="pug">
.row.fit.items-center.content-center.justify-center.bg-grey-2
  q-btn(v-if="showAddBtn" icon="add" outline color="primary" round @click="handleAdd" size="lg")
  //- .row.full-width.justify-center.q-ma-sm
    span Контекст
  input(type="file" hidden ref="photo"  @change="photoChanged")
  img(v-if="photoUrl" :src="photoUrl" height="100%")
</template>

<script>
export default {
  name: 'content_add',
  props: {},
  data () {
    return {
      type: '',
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
    handleAdd () {
      this.$log('handleAdd')
      this.$q.bottomSheet({
        message: 'Выберите тип контента',
        actions: [
          {id: 'photo', label: 'Изображение', icon: 'image'},
          {id: 'video', label: 'Видео', icon: 'videocam'},
          {id: 'quote', label: 'Цитатка', icon: 'format_quote'},
          {id: 'vkpost', label: 'Пост ВК', icon: 'menu'}
        ]
      }).onOk(action => {
        this.$log('Type chosen', action.id)
        this.$set(this, 'type', action.id)
      })
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
                impersonate(login: "4321ip@mail.ru")
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
        if (to === 'photo') {
          this.$log('load photo')
          this.$q.bottomSheet({
            message: 'Где будем брать фотку',
            actions: [
              {id: 'device', label: 'С устройства', icon: 'image'},
              {id: 'google', label: 'Из Google', icon: 'image'},
              {id: 'pinterest', label: 'Из Pinterest', icon: 'image'}
            ]
          }).onOk(action => {
            if (action.id === 'device') {
              this.$log('photo from DEVICE')
              this.$refs.photo.click()
            } else if (action.id === 'google') {
              this.$log('photo from GOOGLE')
            } else if (action.id === 'pinterest') {
              this.$log('photo from PINTEREST')
            }
          })
        } else if (to === 'video') {
          this.$log('load youtube')
          this.$q.bottomSheet({
            message: 'Где будем брать видео',
            actions: [
              {id: 'device', label: 'С устройства'},
              {id: 'link', label: 'Ссылка YouTube'},
              {id: 'youtube_find', label: 'Найти в YouTube'},
              {id: 'vk_find', label: 'Найти в Вконтакте'}
            ]
          }).onOk(action => {
            if (action.id === 'device') {
              this.$log('video from DEVICE')
            } else if (action.id === 'link') {
              this.$log('video from LINK')
            } else if (action.id === 'youtube_find') {
              this.$log('video from YOUTUBE')
            }
          })
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
