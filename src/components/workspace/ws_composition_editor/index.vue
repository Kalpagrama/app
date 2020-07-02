<template lang="pug">
component(
  v-if="content"
  :sid="sid"
  :is="component[content.type]"
  :composition="value"
  :content="content"
  :options="options"
  :sidPlayerReady="sidPlayer"
  @close="$emit('close')")
  template(v-slot:progressActions)
    slot(name="progressActions")
  template(v-slot:progressBar)
    slot(name="progressBar")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import videoEditor from './video_editor'
import imageEditor from './image_editor'

export default {
  name: 'wsCompositionEditor',
  components: {videoEditor, imageEditor},
  props: ['value', 'sid', 'sidPlayer', 'options'],
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
