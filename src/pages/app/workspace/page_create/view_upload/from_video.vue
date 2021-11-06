<template lang="pug">
  .row.full-width.items-start.content-start.justify-center
    div( :style=`{ maxWidth: $store.state.ui.pageWidth+'px' }`).row.full-width.q-mt-sm
      video(
        controls
        :src="fileSrc"
        :style=`{maxHeight: '400px'
      }`
      ).full-width.br-10
      .row.full-width
        .col
        q-btn(v-if="!createdContent"
          @click="uploadContent"
          :loading="loading"
          :disable="loading"
          flat no-caps color="green") {{$t('Upload')}}
      div(v-if="createdContent").row.full-width
        q-linear-progress(size='5px' :value="progressValue / 100" color="green-10").row.full-width.q-px-sm
        //transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
        //  figures-editor(
        //    :player="player"
        //    :convert="convertPxToTime"
        //    :style=`{
        //            left: 'calc(' + (player.figures[0].t/player.duration)*100+'% - 6px)',
        //            width:'calc(' + ((player.figures[1].t-player.figures[0].t)/player.duration)*100+'% + 16px)',
        //          }`
        //    @first="zoomWorking = true, figureEditing = true"
        //    @final="zoomWorking = false, figureEditing = false")
        //q-input(
        //  v-model="contentVideo.name"
        //  borderless dark dense
        //  :placeholder="$t('Название видео')"
        //  counter maxlength="108"
        //  type="textarea" autogrow
        //  :input-style=`{
        //        padding: '16px',
        //        fontSize: '14px',
        //        fontWeight: 'bold',
        //        background: 'rgb(35,35,35)',
        //        borderRadius: '10px',
        //        minHeight: '50px',
        //      }`
        //).full-width.q-mt-xs
        //q-input(
        //  v-model="contentVideo.description"
        //  borderless dark dense
        //  :placeholder="$t('Описание видео')"
        //  counter maxlength="5000"
        //  type="textarea" autogrow
        //  :input-style=`{
        //        padding: '16px',
        //        fontSize: '12px',
        //        background: 'rgb(35,35,35)',
        //        borderRadius: '10px',
        //        minHeight: '100px',
        //      }`
        //).full-width.q-my-sm
        //edit-spheres(
        //  ref="editSpheres"
        //  :sphereOwner="contentVideo"
        //  :maxSphereCnt="10"
        //  :placeholderText="$t('Добавьте ключевые слова')"
        //  ).q-my-sm
</template>

<script>
import { ContentApi } from 'src/api/content'
import { RxCollectionEnum } from 'src/system/rxdb'
import { ObjectTypeEnum } from 'src/system/common/enums'
import editSpheres from 'src/pages/app/content/node_editor/edit_spheres.vue'
import { assert } from 'src/system/common/utils'

export default {
  components: {
    editSpheres,
  },
  name: 'fromVideo',
  props: ['file', 'fileSrc'],
  data () {
    return {
      progressValue: 0,
      contentVideo: {name: '', description: '', spheres: []},
      loading: false,
      createdContent: null
    }
  },
  methods: {
    async uploadContent () {
      this.$log('uploadContent')
      try {
        this.loading = true
        let contentKalpa = await ContentApi.contentCreateFromFile(this.file, this.contentVideo.name, this.contentVideo.description, this.contentVideo.spheres)
        this.$log('contentKalpa', contentKalpa)
        if (!this.createdContent || this.createdContent.oid !== contentKalpa.oid){
          // так бывает если повторно закачиваем тот же ролик (бэкенд отдает старый(закачанный ранее))
          this.createdContent = await this.$rxdb.get(RxCollectionEnum.OBJ, contentKalpa.oid)
        }
        // check bookmark with contentKalpa.oid
        let { items: [content] } = await this.$rxdb.find({
          selector: {
            rxCollectionEnum: RxCollectionEnum.WS_CONTENT,
            oid: contentKalpa.oid
          }
        })
        // create bookmark
        if (!content) {
          let contentInput = {
            type: ObjectTypeEnum.VIDEO,
            oid: contentKalpa.oid,
            name: '',
            thumbUrl: contentKalpa.thumbUrl
          }
          this.$log('contentInput', contentInput)
          // create
          content = await this.$rxdb.set(RxCollectionEnum.WS_CONTENT, contentInput)
          this.$log('content', content)
        }
        assert(content && content.oid)
        await this.$router.replace('/workspace/contents/' + content.oid)
      } finally {
        this.loading = false
      }
    },
    async onCreateEvent(event) {
      assert(event && event.object)
      if (event.object.type === ObjectTypeEnum.VIDEO){
        this.createdContent = await this.$rxdb.get(RxCollectionEnum.OBJ, event.object.oid) // получим полный созданный объект
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
  beforeDestroy () {
    this.$log('beforeDestroy')
    this.$eventBus.$off('event-object-created', this.onCreateEvent)
    this.$eventBus.$off('event-progress', this.onProgressEvent)
  }
}
</script>
