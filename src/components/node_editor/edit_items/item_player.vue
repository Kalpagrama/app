<template lang="pug">
div(
  :style=`{position: 'relative',}`
  ).row.full-width.items-start.content-start
  //- opened
  content-player(
    v-if="contentKalpa"
    :contentKalpa="contentKalpa"
    @player="player = $event"
    :options=`{
      showBar: false,
      showActions: false,
    }`
    :style=`{
    }`)
    template(v-slot:footer)
      composition-bar(
        v-if="player && !isEditing"
        v-show="isOpened"
        :isActive="true"
        :player="player"
        :contentKalpa="contentKalpa"
        :composition="item"
        actionsPosition="top"
        :barStyles=`{
          background: 'rgba(45,45,45)',
        }`
        :style=`{
          height: '53px',
        }`)
      composition-editor(
        v-if="player && isEditing"
        v-show="isOpened"
        :contentKalpa="contentKalpa"
        :composition="item"
        :player="player")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import contentPlayer from 'components/content_player/index.vue'
import compositionBar from 'components/composition/composition_bar/index.vue'
import compositionEditor from 'components/composition/composition_editor/index.vue'

export default {
  name: 'itemPlayer',
  components: {contentPlayer, compositionBar, compositionEditor},
  props: ['item', 'isActive', 'isEditing', 'isOpened'],
  data () {
    return {
      contentKalpa: null,
      player: null,
    }
  },
  watch: {
    isActive: {
      handler (to, from) {
        this.$log('isActive TO', to)
      }
    }
  },
  methods: {
  },
  async mounted () {
    this.$log('mounted')
    if (!this.contentKalpa) this.contentKalpa = await this.$rxdb.get(RxCollectionEnum.OBJ, this.item.layers[0].contentOid)
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
