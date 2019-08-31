<template lang="pug">
div(
  :style=`{maxWidth: '500px', height: '80vh', width: 'calc(100% - 20px)', borderRadius: '24px 24px 0px 0px', overflow: 'hidden'}`
  ).row.justify-center.items-start.content-start.bg-white.q-mx-md
  //- header
  div(:style=`{height: '60px'}`).row.full-width.items-center.q-px-sm
    q-btn(round flat icon="keyboard_arrow_left" color="grey-8" @click="prev()")
    q-icon(v-if="contentType" :name="contentTypes[contentType].icon" :color="contentTypes[contentType].color" size="37px").q-ml-xs
    .col.q-px-sm
      span {{ steps[step].name }}
    q-btn(round flat icon="check" color="primary" @click="next()")
  //- find type
  div(v-show="step === 'findType'").row.full-width.items-start.content-start
    div(
      v-for="(c, ckey) in contentTypes" :key="ckey" @click="contentTypeClick(c, ckey)"
      :style=`{height: '200px'}`
      ).col
      .row.fit.justify-center.items-center.content-center.hr.cursor-pointer
        .row.full-width.justify-center
          q-icon(:name="c.icon" :color="c.color" size="60px")
        .row.full-width.justify-center
          span {{ c.name }}
  //- find image content
  div(v-show="step === 'findContent' && contentType === 'IMAGE'").row.full-width.q-pa-md
    q-input(v-model="imageUrlInput" filled placeholder="Вставье ссылку" @click="imageUrlInputChanged").full-width
    div(:style=`{height: '80px'}`).row.full-width.items-end.justify-center.q-pb-md
      span или возьмите с устройства
    .row.full-width.justify-center
      div(
        @click="$refs.imageFileInput.click()"
        :style=`{width: '100px', height: '100px', borderRadius: '4px'}`
        ).row.items-center.justify-center.bg-grey-3.hr.cursor-pointer
        input(type="file" hidden ref="imageFileInput" accept="image/*" @change="imageFileChanged")
        q-icon(name="attachment" size="50px" color="grey-8").rotate-90
  //- find video content
  div(v-show="step === 'findContent' && contentType === 'VIDEO'").row.full-width.q-pa-md
    q-input(v-model="videoUrlInput" filled placeholder="Вставьте ссылку на YouTube" @input="videoUrlInputChanged").full-width
    div(:style=`{height: '80px'}`).row.full-width.items-end.justify-center.q-pb-md
      span или возьмите с устройства
    .row.full-width.justify-center
      div(
        @click="$refs.videoFileInput.click()"
        :style=`{width: '100px', height: '100px', borderRadius: '4px'}`
        ).row.items-center.justify-center.bg-grey-3.hr.cursor-pointer
        input(type="file" hidden ref="videoFileInput" accept="video/mp4,video/x-m4v,video/*" @change="videoFileChanged")
        q-icon(name="attachment" size="50px" color="grey-8").rotate-90
  //- preview image content
  div(v-if="step === 'previewContent' && contentType === 'IMAGE'").row.full-width.items-start
    img(:src="imageUrl" :style=`{width: '100%', maxHeight: '400px', objectFit: 'contain'}`)
  //- preview video content
  div(v-if="step === 'previewContent' && contentType === 'VIDEO'").row.full-width.items-start
    //- iframe(
    //-   :src="videoLinkYoutube"
    //-   :style=`{width: '100%', height: '100vh', maxHeight: '400px', objectFit: 'contain'}`
    //-   frameborder="0"
    //-   autoplay
    //-   allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
    //-   allowfullscreen)
    node-video(:url="videoUrl" :zIndex="100" :active="true" :visible="true" :style=`{maxHeight: '400px', objectFit: 'contain'}`)
  //- upload content
  div(v-if="step === 'uploadContent'").row.full-width.justify-center.items-start
    span {{contentUploadProgress}}
    span {{contentUploadDone}}
</template>

<script>
import nodeVideo from 'components/node_inst/node_fragment_video'
import nodeImage from 'components/node_inst/node_fragment_image'

export default {
  name: 'nodeCreator__contentFind',
  components: {nodeVideo, nodeImage},
  data () {
    return {
      step: 'findType',
      steps: {
        findType: {name: 'Выберите тип контента'},
        findContent: {name: 'Поиск'},
        previewContent: {name: 'Предосмотр'},
        uploadContent: {name: 'Загрузка'}
      },
      contentTypes: {
        VIDEO: {name: 'Видео', icon: 'movie_creation', color: 'red'},
        IMAGE: {name: 'Изображение', icon: 'panorama', color: 'green'},
        // BOOK: {name: 'Книга'},
        // CODE: {name: 'Репозиторий'},
        // HTML: {name: 'Веб-страница'}
      },
      contentSource: undefined,
      contentType: undefined,
      contentUploadProgress: 0,
      contentUploadDone: false,
      videoLinkValidated: false,
      videoFile: undefined,
      videoUrl: undefined,
      videoUrlInput: undefined,
      imageUrl: undefined,
      imageUrlInput: undefined,
      imageFile: undefined
    }
  },
  computed: {
    videoLinkYoutube () {
      if (!this.videoUrl) return
      let id = ''
      let arr = this.videoUrl.split('/')
      if (arr[arr.length - 2] === 'embed') {
        id = arr[arr.length - 1]
      } else {
        let s = this.videoUrl.split('=')
        id = s[1]
      }
      return `https://www.youtube.com/embed/${id}`
    }
  },
  watch: {
    imageLink: {
      handler (to, from) {
        this.$log('imageLink CHANGED', to)
      }
    },
    step: {
      async handler (to, from) {
        this.$log('step CHANGED', to)
        switch (to) {
          case 'findType': {
            this.$log('findType')
            break
          }
          case 'findContent': {
            this.$log('findContent')
            break
          }
          case 'previewContent': {
            this.$log('previewContent')
            break
          }
          case 'uploadContent': {
            this.$log('uploadContent')
            // TODO: validation
            // if (this.)
            let oid
            if (this.contentType === 'VIDEO') {
              if (this.contentSource === 'youtube') {
                oid = await this.uploadUrl(this.videoUrl)
              } else if (this.contentSource === 'device') {
                oid = await this.uploadFile(this.videoFile)
              }
            } else if (this.contentType === 'IMAGE') {
              if (this.contentSource === 'internet') {
                oid = await this.uploadUrl(this.imageUrl)
              } else if (this.contentSource) {
                oid = await this.uploadFile(this.imageFile)
              }
            }
            this.$log('uploadContent done', oid)
            break
          }
        }
      }
    }
  },
  methods: {
    linkValidate (link) {
      try {
        let l = new URL(link)
        return l
      } catch (e) {
        return false
      }
    },
    contentTypeClick (c, ckey) {
      this.$log('contentTypeClick', c, ckey)
      this.$set(this, 'contentType', ckey)
      this.step = 'findContent'
    },
    videoUrlInputChanged (val) {
      this.$log('videoUrlInputChanged', val)
      this.contentSource = 'youtube'
    },
    async videoFileChanged ({ target: { validity, files: [file] } }) {
      this.$log('videoFileChanged', file)
      this.contentSource = 'device'
      this.videoFile = file
      this.videoUrl = URL.createObjectURL(file)
      this.step = 'previewContent'
    },
    imageUrlInputChanged (val) {
      this.$log('imageUrlInputChanged', val)
      this.contentSource = 'internet'
    },
    async imageFileChanged ({ target: { validity, files: [file] } }) {
      this.$log('imageFileChanged', file)
      this.contentSource = 'device'
      this.imageFile = file
      this.imageUrl = URL.createObjectURL(file)
      this.step = 'previewContent'
    },
    async uploadFile (file) {
      this.$log('uploadFile')
      let {data: {uploadContentFile: {oid}}} = await this.$apollo.mutate({
        client: 'upload',
        mutation: gql`
          mutation uploadContentFile ($file: Upload!) {
            uploadContentFile (file: $file) {
              oid
              type
            }
          }
        `,
        variables: {
          file: file
        }
      })
      return oid
    },
    async uploadUrl (url) {
      this.$log('uploadUrl')
      let {data: {uploadContentUrl: {oid}}} = await this.$apollo.mutate({
        client: 'upload',
        mutation: gql`
          mutation uploadContentUrl ($url: String!) {
            uploadContentUrl(url: $url) {
              oid
              type
            }
          }
        `,
        variables: {
          url: url
        }
      })
      return oid
    },
    next () {
      this.$log('next')
      switch (this.step) {
        case 'findType': {
          this.$log('next findType')
          if (!this.contentType) {
            this.showError('Сначала выберите тип контента!')
            return
          }
          this.step = 'findContent'
          break
        }
        case 'findContent': {
          this.$log('next findContent')
          this.step = 'previewContent'
          this.contentLoading = true
          break
        }
        case 'previewContent': {
          this.$log('next previewContent')
          this.$set(this, 'step', 'uploadContent')
          // this.step = 'uploadContent'
          break
        }
        case 'uploadContent': {
          this.$log('next loadContent')
          this.contentLoading = false
          if (!this.videoUrl) {
            this.showError('Сначала выберите видео!')
            return
          }
          this.step = 'previewContent'
          break
        }
      }
    },
    prev () {
      this.$log('prev')
      switch (this.step) {
        case 'findType': {
          this.$log('prev findType')
          this.$emit('close')
          break
        }
        case 'findContent': {
          this.$log('prev findContent')
          this.contentType = undefined
          this.step = 'findType'
          break
        }
        case 'previewContent': {
          this.$log('prev previewContent')
          this.step = 'findContent'
          break
        }
        case 'uploadContent': {
          this.$log('prev loadContent')
          this.contentLoading = false
          this.step = 'findContent'
          break
        }
      }
    },
    showError (msg) {
      this.$q.notify({message: msg, color: 'red', textColor: 'white'})
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
