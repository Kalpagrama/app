<template lang="pug">
component(
  v-if="content"
  :is="component[content.type]"
  :composition="value"
  :content="content"
  :sidPlayerReady="sidPlayer"
  @close="$emit('close')")
  template(v-slot:actions)
    slot(name="actions")
//- .column.fit.bg-blue
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import videoEditor from './video_editor'
// import imageEditor from './image_editor'

export default {
  name: 'wsCompositionEditor',
  components: {videoEditor},
  props: ['value', 'sidPlayer'],
  data () {
    return {
      content: null,
      component: {
        VIDEO: 'video-editor',
        IMAGE: 'image-editor',
        BOOK: 'book-editor',
        WEB: 'web-editor',
      }
    }
  },
  async mounted () {
    this.$log('mounted')
    this.content = await this.$rxdb.get(RxCollectionEnum.OBJ, this.value.contentOid)
  }
}
</script>
