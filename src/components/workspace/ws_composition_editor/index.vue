<template lang="pug">
video-editor(
  v-if="content"
  @createNode="$emit('createNode')"
  @close="$emit('close')"
  @delete="$emit('delete')"
  :options="options"
  :composition="value"
  :contentKalpa="content"
  :stateExplorerReady="stateExplorer")
  template(v-slot:actions)
    slot(name="actions")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import videoEditor from './video_editor'

export default {
  name: 'wsCompositionEditor',
  components: {videoEditor},
  props: ['value', 'options', 'stateExplorer'],
  data () {
    return {
      content: null
    }
  },
  async mounted () {
    this.$log('mounted')
    this.content = await this.$rxdb.get(RxCollectionEnum.OBJ, this.value.contentOid)
  }
}
</script>
