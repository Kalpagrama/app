<template lang="pug">
.row.full-width.items-start.content-start.justify-center
  q-dialog(
    v-model="contentCardEditorShow"
    :maximized="$q.screen.xs"
    @hide="")
    content-card-editor(
      v-if="createdContent"
      :showBottomMenu="false"
      :contentOid="createdContent.oid"
      @close="contentCardEditorShow = false, this.$router.replace('/workspace/contents/video')")
  div( :style=`{ maxWidth: $store.state.ui.pageWidth+'px' }`).row.full-width.q-mt-sm
    video(
      controls
      :src="fileSrc"
      :style=`{maxHeight: '400px'
    }`
    ).full-width.br-10
    div(v-if="createdContent").row.full-width
      q-linear-progress(size='5px' :value="progressValue / 100" color="green-10").row.full-width.q-px-sm
    .row.full-width
      .col
      q-btn(v-if="!createdContent"
        @click="uploadContent"
        :loading="loading"
        :disable="loading"
        flat no-caps color="green") {{$t('Загрузить')}}
      q-btn(v-else
        @click="contentCardEditorShow = true"
        flat no-caps color="green") {{$t('Редактировать')}}
</template>

<script>
import { ContentApi } from 'src/api/content'
import { RxCollectionEnum } from 'src/system/rxdb'
import { ObjectTypeEnum } from 'src/system/common/enums'
import contentCardEditor from 'src/components/kalpa_item/item_card/editor/content.vue'
import editSpheres from 'src/pages/app/content/node_editor/edit_spheres.vue'
import { assert } from 'src/system/common/utils'
import cloneDeep from 'lodash/cloneDeep'

export default {
  components: {
    editSpheres,
    contentCardEditor
  },
  name: 'fromVideo',
  props: ['file', 'fileSrc'],
  data () {
    return {
      progressValue: 0,
      contentVideo: {name: '', description: '', spheres: []},
      loading: false,
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
    async uploadContent () {
      this.$log('uploadContent')
      try {
        this.loading = true
        this.createdContent = await ContentApi.contentCreateFromFile(this.file, this.contentVideo.name, this.contentVideo.description, this.contentVideo.spheres)
        this.$logT('this.createdContent=', cloneDeep(this.createdContent))
        this.contentCardEditorShow = true
        // бэкенд сам вставит в мастерскую WS_CONTENT и пришлет события о создании контента
      } finally {
        this.loading = false
      }
    },
    async onCreateEvent(event) {
      assert(event && event.object)
      // событие о создании приходит до того как отработает contentCreateFromFile
      if (event.object.type === ObjectTypeEnum.VIDEO){
        this.createdContent = await this.$rxdb.get(RxCollectionEnum.OBJ, event.object.oid) // получим полный созданный объект\
        // this.$logT('this.createdContent=(2)', cloneDeep(this.createdContent))
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
