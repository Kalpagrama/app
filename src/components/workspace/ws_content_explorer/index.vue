<template lang="pug">
component(
  v-if="value && content"
  @close="$emit('close')"
  :is="component[value.contentType]"
  :ctx="ctx"
  :content="content"
  :value="value")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import videoExplorer from './video_explorer_new'

export default {
  name: 'wsContentExplorer',
  components: {videoExplorer},
  props: {
    value: {type: Object},
    ctx: {
      type: String,
      default () {
        return 'workspace'
      }
    }
  },
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
    this.$log('value', this.value)
    this.content = await this.$rxdb.get(RxCollectionEnum.OBJ, this.value.contentOid)
  }
}
</script>
