<template lang="pug">
.row.full-width.justify-center
  div(
    :style=`{
      position: 'relative',
      maxWidth: $store.state.ui.pageWidth+'px',
    }`
    ).row.full-width.items-start.content-start
    //- 1/1 ratio image croppper wrapper
    div(
      :style=`{
        position: 'relative',
        paddingBottom: '100%',
      }`
      ).row.full-width
      div(
        :style=`{
          position: 'absolute', zIndex: 10,
        }`
        ).row.fit
        image-cropper(
          v-if="!src"
          ref="imageCropper"
          :src="src || fileSrc"
          :options=`{
            background: false,
            background: 'rgb(35,35,35)',
          }`
          :styles=`{
            background: 'rgb(35,35,35)',
          }`
          :style=`{
            borderRadius: '10px',
            overflow: 'hidden',
          }`
          ).fit
        img(
          v-if="src"
          :src="src"
          :style=`{
            objectFit: 'contain',
            background: 'rgb(35,35,35)',
            borderRadius: '10px',
          }`
          ).fit
    //- footer
    div(
      :style=`{
      }`
      ).row.full-width.q-pa-sm
      div(
        v-if="!src"
        ).row.full-width
        q-btn(flat dense color="white" no-caps @click="$emit('delete')") Назад
        .col
        q-btn(flat dense color="white" no-caps @click="crop()") Далее
      div(
        v-else
        ).row.full-width.items-center.content-center.q-pa-sm
        q-btn(flat dense color="white" no-caps @click="backToCropper()") Назад
        .col
        q-btn(flat desne color="green" no-caps icon-right="check" @click="uploadContent()")
          span.q-mr-md Зарузить
</template>

<script>
import imageCropper from 'components/image_cropper/index.vue'
import { RxCollectionEnum } from 'src/system/rxdb'
import { ContentApi } from 'src/api/content'
import { UserApi } from 'src/api/user'

export default {
  name: 'fromImage',
  props: ['file', 'fileSrc'],
  components: {
    imageCropper,
  },
  data () {
    return {
      src: null,
      srcBlob: null,
    }
  },
  computed: {
    uploadContentConfirmMessage () {
      return 'Загружая изображение, оно будет доступно всем в сети Кальпаграма, согласны ?'
    }
  },
  methods: {
    backToCropper () {
      this.$log('backToCropper')
      this.src = null
    },
    crop () {
      this.$log('crop START')
      // crop and go next
      let blob = this.$refs.imageCropper.cropper.getCroppedCanvas().toBlob((blob) => {
        this.$log('crop DONE')
        this.srcBlob = blob
        this.src = URL.createObjectURL(blob)
      })
    },
    async uploadContent () {
      this.$log('uploadContent')
      // check confirm
      let confirmed = confirm(this.uploadContentConfirmMessage)
      if (!confirmed) return
      // get contentKalpa by file
      let contentKalpa = await ContentApi.contentCreateFromFile(this.srcBlob)
      this.$log('contentKalpa', contentKalpa)
      // check bookmark with contentKalpa.oid
      let {items: [bookmark]} = await this.$rxdb.find({selector: {rxCollectionEnum: RxCollectionEnum.WS_BOOKMARK, oid: contentKalpa.oid}})
      // got bookmark, revive from trash ? subscribe ?
      if (bookmark) {
      }
      // create bookmark
      else {
        let bookmarkInput = {
          type: 'IMAGE',
          oid: contentKalpa.oid,
          name: '',
          thumbUrl: contentKalpa.thumbUrl,
          isSubscribed: true
        }
        this.$log('bookmarkInput', bookmarkInput)
        // create
        bookmark = await this.$rxdb.set(RxCollectionEnum.WS_BOOKMARK, bookmarkInput)
        this.$log('bookmark', bookmark)
        // subscribe to this bookmark
        // if (!await UserApi.isSubscribed(contentKalpa.oid)) await UserApi.subscribe(contentKalpa.oid)
      }
      // go to this content...
      this.$router.push('/content/' + contentKalpa.oid)
    }
  }
}
</script>
