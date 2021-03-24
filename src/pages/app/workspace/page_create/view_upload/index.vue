<template lang="pug">
.row.full-width.items-start.content-start
  div(
    :style=`{
      height: $q.screen.width+'px',
    }`
    ).row.full-width.items-start.content-start.justify-center.q-px-sm
    //- no file
    div(
      v-if="!file"
      ).row.full-width.justify-center
      div(
        :style=`{
          maxWidth: $store.state.ui.pageWidth+'px',
        }`
        ).row.full-width
        div(:style=`{position: 'relative', paddingBottom: '100%'}`).row.full-width
          div(
            :style=`{
              //- height: $q.screen.height/2+'px',
              position: 'absolute', zIndex: 10,
              background: 'rgb(35,35,35)',
              borderRadius: '10px',
            }`
            ).row.fit.items-center.contentc-center.justify-center
            q-btn(
              @click="start()"
              flat no-caps color="white"
              :style=`{
                height: '60px',
                //- height: $q.screen.height/2+'px',
              }`
              ).b-40
              span.text-white {{$t('Upload from device')}}
          input(
            ref="fileInput"
            type="file"
            @input="fileChanged"
            :accept="accept"
            :style=`{
              display: 'none',
            }`)
    //- file
    div(
      v-if="file"
      ).row.full-width
      component(
        :is="'from-'+fileType"
        :file="file"
        :fileSrc="fileSrc")
</template>

<script>
import fromImage from './from_image.vue'
import fromVideo from './from_video.vue'
import fromBook from './from_book.vue'

export default {
  name: 'viewUpload',
  components: {
    fromImage,
    fromVideo,
    fromBook,
  },
  data () {
    return {
      file: null,
      // fileType: null,
      fileSrc: null,
    }
  },
  computed: {
    accept () {
      return 'image/*, video/*, application/epub+zip'
    },
    fileType () {
      let t = this.file.type.split('/')[0]
      if (t === 'application') {
        return 'book'
      }
      else {
        return t
      }
    }
  },
  methods: {
    start () {
      this.$log('start')
      this.$refs.fileInput.click()
    },
    fileChanged (e) {
      this.$log('fileChanged', e)
      // this.$emit('file', e.target.files[0])
      this.file = e.target.files[0]
      // this.fileType = this.file
      this.fileSrc = URL.createObjectURL(this.file)
      this.$emit('started')
      // contentFile && contentFile.type.split('/')[0] === 'image'
      // this.$emit('file', new Blob(e.target.files[0]))
      // e.target.value = ''
    }
  }
}
</script>
