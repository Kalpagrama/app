<template lang="pug">
.row.full-width.justify-center.q-py-xl
  q-dialog(
    v-model="contentCardEditorShow"
    :maximized="$q.screen.xs"
    @hide="")
    content-card-editor(
      v-if="createdContent"
      :showBottomMenu="false"
      :contentOid="createdContent.oid"
      @close="contentCardEditorShow = false, this.$router.replace('/workspace/contents/book')")
  q-spinner(size="50px" color="green").q-my-xl
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import contentCardEditor from 'src/components/kalpa_item/item_card/editor/content.vue'
import { ContentApi } from 'src/api/content'
import { UserApi } from 'src/api/user'
import { assert } from 'src/system/common/utils'
import { ObjectTypeEnum } from 'src/system/common/enums'

export default {
  name: 'fromBook',
  props: ['file', 'fileSrc'],
  components: {contentCardEditor},
  data () {
    return {
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
    async uploadContent () {
      this.$log('uploadContent')
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
      if (event.object.type === ObjectTypeEnum.BOOK){
        this.createdContent = await this.$rxdb.get(RxCollectionEnum.OBJ, event.object.oid) // получим полный созданный объект\
        this.contentCardEditorShow = true
      }
    },
    onProgressEvent(event) {
      this.$log('onProgressEvent', 'event', event)
      this.progressValue = event.progress
    }
  },
  async mounted () {
    this.$log('mounted')
    this.$eventBus.$on('event-object-created', this.onCreateEvent)
    this.$eventBus.$on('event-progress', this.onProgressEvent)
    await this.uploadContent()
  },
  beforeUnmount () {
    this.$log('beforeDestroy')
    this.$eventBus.$off('event-object-created', this.onCreateEvent)
    this.$eventBus.$off('event-progress', this.onProgressEvent)
  }
}
</script>
