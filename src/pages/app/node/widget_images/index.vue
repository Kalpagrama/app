// образы на суть
<template lang="pug">
  div(:style=`{position: 'relative'}`).row.full-width
    // мини-образы
    div(v-if="sameEssenceNodes.length" @click="expanded=true").row.full-width.justify-start.cursor-pointer
      small.text-grey-8.text-weight-thin.q-pl-xs {{$t('На смысл')}}
      small.text-grey-8.text-weight-bolder.text-italic.q-px-xs {{node.name.substring(0, 22)}}{{node.name.length>22 ? '...': ''}}
      small.text-grey-8.text-weight-thin {{$getNoun(sameEssenceNodes.length,$t('найден'),$t('найдено'),$t('найдено'))}}
      small.text-green-10.text-weight-bolder.q-px-xs {{sameEssenceNodes.length}}
      small.text-grey-8.text-weight-thin {{$getNoun(sameEssenceNodes.length, $t('образ'), $t('образа'), $t('образов'))}}
    small(v-else).row.full-width ...
    div(:style=`{position: 'relative', height: previewHeight+'px',  maxWidth: Math.min($q.screen.width, $store.state.ui.pageWidth)+'px', borderRadius: '10px', overflow: 'hidden'}`).row.full-width
      q-btn(:disable="!itemsLeft.length" round flat icon="chevron_left" color="white"
        size="sm" :style=`{zIndex: '100', borderRadius: '10px'}` @click="currentIndx--").absolute-left
      //q-btn(round icon="add" size="sm" color="green" :style=`{borderRadius: '50%', zIndex: '100', opacity: '0.7'}` @click="itemEditorShow=true").absolute-center
      q-virtual-scroll(ref="vs" :items="sameEssenceNodes" virtual-scroll-horizontal :virtual-scroll-item-size="previewHeight*1.618" :style=`{}` @virtual-scroll="onVsScroll").col
        template(v-slot="{ item, index: itemIndex}")
          div(:style=`{position: 'relative', overflow: 'hidden', height: previewHeight+'px', width: (previewHeight*1.618)+'px', borderRadius: '10px',
                  border: currentIndx === itemIndex ? '2px solid '+$getPaletteColor('green-10') : null,
                  marginLeft: '1px', marginRight: '1px'}`
            @click="currentIndx = itemIndex").row.items-center.center-start.content-center
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
      q-btn(:disable="!itemsRight.length" round flat icon="chevron_right" color="white"
        size="sm" :style=`{zIndex: '100', borderRadius: '10px'}` @click="currentIndx++").absolute-right
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import essenceVoteBall from 'src/components/essence/essence_vote_ball.vue'
import essenceSpheres from 'src/components/essence/essence_spheres'
import essenceActions from 'src/components/essence/essence_actions.vue'
import listMasonry from 'src/components/list_masonry/index.vue'

import cloneDeep from 'lodash/cloneDeep'
import debounce from 'lodash/debounce'
import { assert } from 'src/system/common/utils'

export default {
  name: 'pageImages',
  components: {
    essenceVoteBall, essenceSpheres, essenceActions, listMasonry
  },
  props: {
    node: { type: Object },
  },
  data () {
    return {
      imageHeightReal: null, // вычисляется обзервером
      imageHeight: Math.min(this.$q.screen.width, this.$store.state.ui.pageWidth) / 1.618, // реальный размер образа (заранее не известен. начальное значение - золотое сечение) обновляется через дебаунс чтобы можно было образы листать
      itemEditorShow: false,
      expanded: false,
      sameEssenceNodesItemsRes: null, // ядра с той же сутью
      currentIndx: -1, // индекс текущего ядра в sameEssenceNodes
      waitIndx: -1, // на какой превьюшке показывать спиннер
      masonryVisibleItems: {}
    }
  },
  computed: {
    newNode () {
      if (!this.node) return null
      let node = cloneDeep(this.node)
      node.items = []
      // node.spheres = []
      return node
    },
    itemsRight () {
      if (this.currentIndx >= 0) return this.sameEssenceNodes.slice(this.currentIndx + 1, this.sameEssenceNodes.length)
      return []
    },
    itemsLeft () {
      if (this.currentIndx >= 0) return this.sameEssenceNodes.slice(0, this.currentIndx)
      return []
    },
    length () {
      return this.sameEssenceNodes.length
    },
    itemWidth () {
      return Math.min(this.$q.screen.width, this.$store.state.ui.pageWidth) / 3
    },
    previewHeight () {
      return this.$q.screen.height / 18
    },
    sameEssenceNodes () {
      // this.$log('sameCompositionNodes calc', this?.node?.oid, cloneDeep(this?.sameEssenceNodesItemsRes?.items))
      let res = []
      if (this.sameEssenceNodesItemsRes && this.node) {
        let itemsCopy = [...this.sameEssenceNodesItemsRes.items]
        let indx = itemsCopy.findIndex(item => item.oid === this.node.oid)
        if (indx >= 0) itemsCopy.splice(indx, 1, this.node) // ядро уже заполнено (чтобы не дергался плер (он уже начал его проигрывать, а потом загрузились sameEssenceNodesItemsRes))
        else itemsCopy.unshift(this.node) // почему-то в sameCompositionNodesItemsRes не оказалось нашего ядра...
        res = itemsCopy
      } else if (this.node) res = [this.node]
      return res
    }
  },
  watch: {
    sameEssenceNodes (to) {
      // this.$log('sameEssenceNodes to', to)
      if (to && this.node) this.currentIndx = to.findIndex(item => item.oid === this.node.oid)
      else this.currentIndx = -1
    },
    node (to) {
      // this.$log('node to=', to)
      if (to) this.currentIndx = this.sameEssenceNodes.findIndex(item => item.oid === to.oid)
      else this.currentIndx = -1
    },
    'node.sphereFromName.oid': {
      immediate: true,
      async handler (to, from) {
        // this.$log('node.sphereFromName.oid to', to)
        this.sameEssenceNodesItemsRes = null
        if (to) {
          this.sameEssenceNodesItemsRes = await this.$rxdb.find({
            selector: {
              rxCollectionEnum: RxCollectionEnum.LST_SPHERE_ITEMS,
              objectTypeEnum: { $in: ['NODE'] },
              oidSphere: to,
              sortStrategy: 'ESSENTIALLY' // 'ACTIVITY', // AGE
            },
            populateObjects: false
          })
        }
      }
    },
    async currentIndx (to) {
      // this.$log('currentIndx to', to)
      if (to >= 0) {
        assert(this.sameEssenceNodes[to])
        this.waitIndx = to
        this.updateImageHeight() // задерживаем debounce (чтобы при листании не менялась высота образа)
        let node = await this.$rxdb.get(RxCollectionEnum.OBJ, this.sameEssenceNodes[to].oid)
        this.$emit('node', node)
        this.waitIndx = -1
        if (this.$refs.vs) this.$refs.vs.scrollTo(to, 'center-force')
      }
    },
    imageHeightReal (to) {
      this.updateImageHeight()
    }
  },
  methods: {
    onVsScroll (details) {
      // this.$log('onVsScroll', details.index)
      // this.$log('onVsScroll range', details.from, details.to)
    },
    masonryItemVisibilityCallback (isVisible, entry) {
      let [oid, index] = entry.target.accessKey.split('-')
      this.$log('masonryItemVisibilityCallback', isVisible, oid, index)
      this.$set(this.masonryVisibleItems, oid, isVisible)
    },
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
