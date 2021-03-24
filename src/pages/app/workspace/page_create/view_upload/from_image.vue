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
        //- ===
        //- idle
        img(
          v-if="['idle', 'essence'].includes(stage)"
          draggable="false"
          :src="fileSrc"
          :style=`{
            objectFit: 'contain',
            borderRadius: '10px',
          }`).fit.b-50
        //- ===
        //- editing
        image-cropper(
          v-if="stage === 'editing'"
          ref="imageCropper"
          :src="fileSrc"
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
        //- ===
        //- essence
        div(
          v-if="stage === 'essence'"
          :style=`{
            position: 'absolute', zIndex: 2000, bottom: '0px',
          }`
          ).row.full-width.justify-center.q-pa-sm
          node-editor(
            :contentKalpa="contentKalpa"
            :player=`{
              figure: figure,
            }`
            :style=`{
              maxWidth: 400+'px',
            }`)
    //- ===
    //- footer
    div(
      :style=`{
      }`
      ).row.full-width.q-py-sm
      div(
        :style=`{
          borderRadius: '10px',
        }`
        ).row.full-width.justify-between.b-40.q-pa-sm
        //- idle
        template(v-if="stage === 'idle'")
          q-btn(
            @click="$emit('delete')"
            flat no-caps color="red") {{$t('Cancel')}}
          q-btn(
            @click="stage = 'editing'"
            :disabled="true"
            flat no-caps color="white")
            span.q-mr-sm {{$t('Edit')}}
          q-btn(
            @click="stage = 'essence'"
            :disabled="true"
            flat no-caps color="white") {{$t('Create node')}}
          q-btn(
            @click="uploadContent()"
            flat no-caps color="green") {{$('Upload')}}
        //- editing
        template(v-if="stage === 'editing'")
          q-btn(
            @click="stage = 'idle'"
            flat no-caps color="red") {{$t('Cancel')}}
          q-btn(
            @click="stage = 'idle'"
            flat no-caps color="green") {{$t('Done')}}
        //- essence
        template(v-if="stage === 'essence'")
          q-btn(
            @click="stage = 'idle'"
            flat no-caps color="red") {{$t('Cancel')}}
          //- q-btn(
            @click="nodePublish()"
            flat no-caps color="green") Опубликов
</template>

<script>
import imageCropper from 'components/image_cropper/index.vue'
import { RxCollectionEnum } from 'src/system/rxdb'
import { ContentApi } from 'src/api/content'
import { UserApi } from 'src/api/user'

import nodeEditor from 'pages/app/content/node_creator/node_editor/index.vue'

export default {
  name: 'fromImage',
  props: ['file', 'fileSrc'],
  components: {
    imageCropper,
    nodeEditor,
  },
  data () {
    return {
      essence: '',
      src: null,
      srcBlob: null,
      stage: 'idle', // idle, editing, essence, (uploading, publishing, loading)
      figure: [{t: null, points: []}]
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
      // let confirmed = confirm(this.uploadContentConfirmMessage)
      // if (!confirmed) return
      // get contentKalpa by file
      let contentKalpa = await ContentApi.contentCreateFromFile(this.file)
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
        if (!await UserApi.isSubscribed(contentKalpa.oid)) await UserApi.subscribe(contentKalpa.oid)
      }
      // go to this content...
      this.$router.push('/content/' + contentKalpa.oid)
    },
    nodePublish () {
      this.$log('nodePublish')
    }
  }
}
</script>
