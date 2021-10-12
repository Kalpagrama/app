// образы на суть
<template lang="pug">
  .row.full-width
    q-dialog(
      v-model="itemEditorShow"
      :maximized="false"
      position="standard")
      essence-editor(
        :item="newNode"
        :publish="true"
        :lockName="true"
        @close="itemEditorShow=false")
    // образ
    div(:style=`{borderRadius: '10px', overflow: 'hidden', height: imageHeight+'px'}`).row.full-width.relative-position.b-0
      // верх образа обрезается(потом отресайзится см updateImageHeight)
      .row.full-width.absolute-bottom.b-0
        q-resize-observer(@resize="imageHeightReal = $event.height")
        q-tab-panels(v-if="imagesNodes.length"
          v-model="imagesNodesIndx"
          :swipeable="true || $q.platform.is.mobile"
          :animated="true || $q.platform.is.mobile"
          dark).full-width
          q-tab-panel(v-for="(n,ix) in imagesNodes" :key="ix" :name="ix").full-width.q-pa-none.b-0
            item-feed(
              :itemShortOrFull="n"
              :isActive="isActive"
              :isVisible="true"
              :showHeader="false"
              :showActions="false"
              :showName="false"
              :showSpheres="false"
              :styles=`{borderRadius: '10px 10px 0px 0px',}`
              )
        .row.full-width
          slot(name="bottom")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import cloneDeep from 'lodash/cloneDeep'
import debounce from 'lodash/debounce'
import { assert } from 'src/system/common/utils'

export default {
  name: 'pageImage',
  components: {},
  props: ['isActive', 'node', 'maxHeight', 'imagesNodes', 'imagesNodesIndx'],
  data () {
    return {
      imageHeightReal: null, // вычисляется обзервером
      imageHeight: Math.min(this.$q.screen.width, this.$store.state.ui.pageWidth) / 1.618, // реальный размер образа (заранее не известен. начальное значение - золотое сечение) обновляется через дебаунс чтобы можно было образы листать
      itemEditorShow: false,
    }
  },
  computed: {
    newNode () {
      if (!this.node) return null
      let node = cloneDeep(this.node)
      node.items = []
      // node.spheres = []
      return node
    }
  },
  watch: {
    imageHeightReal (to) {
      this.updateImageHeight()
    },
    imagesNodesIndx(to){
      this.updateImageHeight() // чтобы картинка не дергалась
    }
  },
  async created () {
    this.$log('created ')
    this.updateImageHeight = debounce(() => {
      if (this.imageHeightReal > 200) this.$gsap.to(this, 0.5, { imageHeight: this.imageHeightReal })
    }, 2000)
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
