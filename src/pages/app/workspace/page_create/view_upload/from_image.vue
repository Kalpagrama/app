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
            flat no-caps color="green") {{$t('Upload')}}
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
import imageCropper from 'src/components/image_cropper/index.vue'
import { RxCollectionEnum } from 'src/system/rxdb'
import { ContentApi } from 'src/api/content'
import { UserApi } from 'src/api/user'

import nodeEditor from 'src/pages/app/content/node_creator/node_editor/index.vue'

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
      let {items: [content]} = await this.$rxdb.find({selector: {rxCollectionEnum: RxCollectionEnum.WS_CONTENT, oid: contentKalpa.oid}})
      if (content) {
      }
      // create bookmark
      else {
        let contentInput = {
          type: 'IMAGE',
          oid: contentKalpa.oid,
          name: '',
          thumbUrl: contentKalpa.thumbUrl,
          paid: false
        }
        this.$log('contentInput', contentInput)
        // create
        content = await this.$rxdb.set(RxCollectionEnum.WS_CONTENT, contentInput)
        this.$log('content', content)
      }
      // go to this content...
      await this.$router.push('/content/' + contentKalpa.oid)
      // this.$router.push('/workspace/contents')
    },
    nodePublish () {
      this.$log('nodePublish')
    }
  }
}
</script>
