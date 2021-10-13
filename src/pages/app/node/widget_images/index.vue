// образы на суть
<template lang="pug">
  div(:style=`{position: 'relative'}`).row.full-width
    // мини-образы
    div(v-if="length" @click="$emit('images-show')").row.full-width.justify-start.cursor-pointer.q-pb-xs
      small.text-grey-7.text-weight-thin.q-pl-xs {{$t('На смысл')}}
      small.text-grey-7.text-weight-bolder.text-italic.q-px-xs {{node.name.substring(0, 22)}}{{node.name.length>22 ? '...': ''}}
      small.text-grey-7.text-weight-thin {{$getNoun(length,$t('найден'),$t('найдено'),$t('найдено'))}}
      small.text-green-8.text-weight-bolder.q-px-xs {{length}}
      small.text-grey-7.text-weight-thin {{$getNoun(length, $t('образ'), $t('образа'), $t('образов'))}}
      q-icon(dense name="expand_more" color="grey-5"  size="14px")
    div(:style=`{position: 'relative', height: previewHeight+'px',  maxWidth: Math.min($q.screen.width, $store.state.ui.pageWidth)+'px', borderRadius: '10px', overflow: 'hidden'}`).row.full-width
      q-btn(v-if="false" :disable="!itemsLeft.length" round flat icon="chevron_left" color="white"
        size="sm" :style=`{zIndex: '100', borderRadius: '10px'}` @click="waitIndx=imagesNodesIndx+1, $emit('set-node', imagesNodes[imagesNodesIndx-1])").absolute-left
      q-virtual-scroll(ref="vs" :items="imagesNodes" virtual-scroll-horizontal :virtual-scroll-item-size="previewHeight*1.618" :style=`{}` @virtual-scroll="onVsScroll").col
        template(v-slot="{ item, index: itemIndex}")
          div(:style=`{position: 'relative', overflow: 'hidden', height: previewHeight+'px', width: (previewHeight*1.618)+'px', borderRadius: '10px',
                  border: imagesNodesIndx === itemIndex ? '2px solid '+$getPaletteColor('green-10') : null,
                  marginLeft: '1px', marginRight: '1px'}`
            @click="itemIndex!==imagesNodesIndx?waitIndx=itemIndex:null, $emit('set-node', imagesNodes[itemIndex])").row.items-center.center-start.content-center
            div(:style=`{maxHeight: (previewHeight*4)+'px', width: (previewHeight*2)+'px'}`).absolute-center
              item-feed(
                :itemShortOrFull="item"
                :showContext="false"
                :isActive="false"
                :isVisible="true"
                :showHeader="false"
                :showActions="false"
                :showName="false"
                :showSpheres="false")
            div(:style=`{minHeight: '200px', width: '100', background: 'rgba(0,0,0,0.5)', zIndex: '50'}`).fit.absolute
            q-spinner(v-if="waitIndx === itemIndex" size="20px" color="green").fit.absolute.q-pa-sm
      q-btn(v-if="false" :disable="!itemsRight.length" round flat icon="chevron_right" color="white"
        size="sm" :style=`{zIndex: '100', borderRadius: '10px'}` @click="waitIndx=imagesNodesIndx+1, $emit('set-node', imagesNodes[imagesNodesIndx+1])").absolute-right
</template>

<script>
import cloneDeep from 'lodash/cloneDeep'
import { assert } from 'src/system/common/utils'

export default {
  name: 'pageImages',
  components: {},
  props: ['node', 'imagesNodes', 'imagesNodesIndx'],
  data () {
    return {
      waitIndx: -1, // на какой превьюшке показывать спиннер
    }
  },
  computed: {
    itemsRight () {
      if (this.imagesNodesIndx >= 0) return this.imagesNodes.slice(this.imagesNodesIndx + 1, this.length)
      return []
    },
    itemsLeft () {
      if (this.imagesNodesIndx >= 0) return this.imagesNodes.slice(0, this.imagesNodesIndx)
      return []
    },
    length () {
      return this.imagesNodes.length
    },
    itemWidth () {
      return Math.min(this.$q.screen.width, this.$store.state.ui.pageWidth) / 3
    },
    previewHeight () {
      return this.$q.screen.height / 18
    }
  },
  watch: {
    async imagesNodesIndx (to) {
      // this.$log('imagesNodesIndx to', to)
      if (to >= 0) {
        this.waitIndx = -1
        if (this.$refs.vs) this.$refs.vs.scrollTo(to, 'center-force')
      }
    }
  },
  methods: {
    onVsScroll (details) {
      // this.$log('onVsScroll', details.index)
      // this.$log('onVsScroll range', details.from, details.to)
    },
  },
  async created () {
    this.$log('created ')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
