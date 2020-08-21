<template lang="pug">
//- //- component(
//-   v-if="value && content"
//-   @compositionAdded="$emit('compositionAdded', $event)"
//-   @compositionPicked="$emit('compositionPicked', $event)"
//-   @close="$emit('close')"
//-   @open="$emit('open')"
//-   :is="component[value.contentType]"
//-   :content="content"
//-   :value="value"
//-   :mode="mode"
//-   :options="options")
//- .row.fit.br.bg-blue
youtube-explorer(
  v-if="value && contentKalpa"
  mode="standalone"
  :contentKalpa="contentKalpa"
  :contentWorkspace="value"
  @close="$emit('close')")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import videoExplorer from './video_explorer'
import imageExplorer from './image_explorer'
import youtubeExplorer from './youtube_explorer'

export default {
  name: 'wsContentExplorer',
  components: {videoExplorer, imageExplorer, youtubeExplorer},
  props: ['mode', 'value', 'options'],
  data () {
    return {
      contentKalpa: null,
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
    this.contentKalpa = await this.$rxdb.get(RxCollectionEnum.OBJ, this.value.contentOid)
    this.$log('contentKalpa', this.contentKalpa)
  }
}
</script>
