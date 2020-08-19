<template lang="pug">
component(
  v-if="value && content"
  @compositionAdded="$emit('compositionAdded', $event)"
  @compositionPicked="$emit('compositionPicked', $event)"
  @close="$emit('close')"
  @open="$emit('open')"
  :is="component[value.contentType]"
  :content="content"
  :value="value"
  :mode="mode"
  :options="options")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import videoExplorer from './video_explorer'
import imageExplorer from './image_explorer'

export default {
  name: 'wsContentExplorer',
  components: {videoExplorer, imageExplorer},
  props: ['mode', 'value', 'options'],
  data () {
    return {
      content: null,
      component: {
        VIDEO: 'video-explorer',
        IMAGE: 'image-explorer',
        BOOK: 'book-explorer',
        WEB: 'web-explorer',
      }
    }
  },
  async mounted () {
    this.$log('mounted')
    this.content = await this.$rxdb.get(RxCollectionEnum.OBJ, this.value.contentOid)
  }
}
</script>
