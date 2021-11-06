// образы на суть
<template lang="pug">
.row.full-width.justify-center.content-start.q-px-sm
  //header
  .row.full-width.justify-between.items-center.relative-position
    q-resize-observer(@resize="headerHeight = $event.height")
    span(:style=`{fontSize: fontSize+'px', textAlign: 'center', position: 'relative'}`).text-grey-5.col {{node.name}}
    //span.text-grey-5 {{$t('Рейтинг образов')}}
    q-btn(round flat color="grey-5" icon="clear" @click="$emit('close')")
  div(:style=`{maxHeight: height-headerHeight+'px'}`).scroll.full-width
    list-masonry(itemKey="oid" :items="imagesNodes")
      template(v-slot:item=`{item, itemIndex}`)
        div(:accessKey="`${item.oid}-${itemIndex}`"
          v-observe-visibility=`{
            throttle: 150,
            callback: masonryItemVisibilityCallback,
          }`
          @click="$emit('set-node', item)").full-width
          item-feed(
            :itemIndex="itemIndex"
            :itemShortOrFull="item"
            :showContext="false"
            :isActive="false"
            :isVisible="masonryVisibleItems[item.oid]"
            :showHeader="false"
            :showActions="false"
            :showName="false"
            :showSpheres="false"
            :styles=`{border: imagesNodesIndx === itemIndex ? '2px solid '+$getPaletteColor('green-9') : null,}`
            )
            template(v-slot:skeleton)
              q-responsive(:ratio="16/9" :style=`{borderRadius: ''}`).full-width
                q-skeleton(type="QBtn" dark).full-width
</template>

<script>
import listMasonry from 'src/components/list_masonry/index.vue'
import cloneDeep from 'lodash/cloneDeep'

export default {
  name: 'pageImages',
  components: { listMasonry},
  props: ['node', 'height', 'imagesNodes', 'imagesNodesIndx'],
  data () {
    return {
      imageHeightReal: null, // вычисляется обзервером
      imageHeight: Math.min(this.$q.screen.width, this.$store.state.ui.pageWidth) / 1.618, // реальный размер образа (заранее не известен. начальное значение - золотое сечение) обновляется через дебаунс чтобы можно было образы листать
      itemEditorShow: false,
      masonryVisibleItems: {}
    }
  },
  computed: {
    fontSize () {
      let l = this.node.name.length
      if (l < 20) return 20
      else if (l < 30) return 16
      else if (l < 40) return 14
      else return 12
    }
  },
  methods: {
    masonryItemVisibilityCallback (isVisible, entry) {
      let [oid, index] = entry.target.accessKey.split('-')
      this.$log('masonryItemVisibilityCallback', isVisible, oid, index)
      this.$set(this.masonryVisibleItems, oid, isVisible)
    },
  },
  async created () {
    this.$log('created ')
  },
  beforeUnmount () {
    this.$log('beforeDestroy')
  }
}
</script>
