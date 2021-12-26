<template lang="pug">
.row.full-width.justify-center
  q-dialog(
    v-model="contentCardEditorShow"
    :maximized="$q.screen.xs"
    @hide="")
    content-card-editor(
      v-if="createdContent"
      :showBottomMenu="false"
      :contentOid="createdContent.oid"
      @close="contentCardEditorShow = false, this.$router.replace('/workspace/contents/')")
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
import contentCardEditor from 'src/components/kalpa_item/item_card/editor/content.vue'
import { RxCollectionEnum } from 'src/system/rxdb'
import { ContentApi } from 'src/api/content'
import { UserApi } from 'src/api/user'

import nodeEditor from 'src/pages/app/content/node_creator/node_editor/index.vue'
import { assert } from 'src/system/common/utils'
import { ObjectTypeEnum } from 'src/system/common/enums'

export default {
  name: 'fromImage',
  props: ['file', 'fileSrc'],
  components: {
    imageCropper,
    nodeEditor,
    contentCardEditor
  },
  data () {
    return {
      essence: '',
      src: null,
      srcBlob: null,
      stage: 'idle', // idle, editing, essence, (uploading, publishing, loading)
      figure: [{t: null, points: []}],
      progressValue: 0,
      createdContent: null,
      contentCardEditorShow: false,
    }
  },
  watch: {
    createdContent: {
      deep: true,
      async handler(to) {
        if (to.primaryOid) { // загрузили, а в системе уже есть такой...
          this.$notify('info', this.$t('Такой контент уже загружен ранее.\nПереходим на существующий.'))
          await this.$router.replace('/content/' + to.primaryOid)
        }
      }
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
      this.createdContent = await ContentApi.contentCreateFromFile(this.file)
      this.contentCardEditorShow = true
      // бэкенд сам вставит в мастерскую WS_CONTENT и пришлет события о создании контента
    },
    nodePublish () {
      this.$log('nodePublish')
    },
    async onCreateEvent(event) {
      assert(event && event.object)
      // событие о создании приходит до того как отработает contentCreateFromFile
      if (event.object.type === ObjectTypeEnum.IMAGE){
        this.createdContent = await this.$rxdb.get(RxCollectionEnum.OBJ, event.object.oid) // получим полный созданный объект\
        this.contentCardEditorShow = true
      }
    },
    onProgressEvent(event) {
      this.$log('onProgressEvent', 'event', event)
      this.progressValue = event.progress
    }
  },
  mounted () {
    this.$log('mounted')
    this.$eventBus.$on('event-object-created', this.onCreateEvent)
    this.$eventBus.$on('event-progress', this.onProgressEvent)
  },
  beforeUnmount () {
    this.$log('beforeDestroy')
    this.$eventBus.$off('event-object-created', this.onCreateEvent)
    this.$eventBus.$off('event-progress', this.onProgressEvent)
  }
}
</script>
