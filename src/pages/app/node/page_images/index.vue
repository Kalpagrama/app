// образы на суть
<template lang="pug">
  div(:style=`{position: 'relative'}`).row.full-width
    q-btn(round flat :icon="expanded ? 'expand_less' : 'expand_more'" :color="expanded ? 'green' : 'white'" :style=`{zIndex: '100'}` @click="expanded=!expanded").absolute-top-right
      //q-badge(align="bottom" dark rounded outline floating color="green") {{length}}
    q-dialog(
      v-model="itemEditorShow"
      :maximized="false"
      position="standard")
      item-editor(
        :item="newNode"
        :publish="true"
        :lockName="true"
        @close="itemEditorShow=false")
    // образ
    div(v-if="!expanded" :style=`{borderRadius: '10px', overflow: 'hidden'}`).row.full-width.position-relative.b-0
      //component(:is="!fixedHeight ? 'q-responsive' : 'div'" :ratio="1.618" :style=`{position: 'relative'}`).row.full-width.b-0
      //q-responsive(:ratio="1.618" :style=`{position: 'relative'}`).row.full-width.b-0
      div(:style=`{position: 'relative'}`).row.full-width.b-0
        div(:style=`{position: 'relative', height: imageHeight+'px'}`).row.full-width
        // item
        .row.full-width.absolute-bottom
          q-resize-observer(@resize="imageHeightReal = $event.height")
          // пока не загрузились sameEssenceNodesItemsRes - показывается картинка
          item-feed(v-if="!sameEssenceNodesItemsRes"
            :itemShortOrFull="node" :isActive="false" :isVisible="-1"
            :showHeader="false" :showActions="false" :showName="false" :showSpheres="false")
          q-tab-panels(v-if="sameEssenceNodesItemsRes"
            v-model="currentIndx"
            :swipeable="$q.platform.is.mobile"
            :animated="$q.platform.is.mobile"
            dark).full-width
            q-tab-panel(v-for="(node,ix) in sameEssenceNodesItemsRes.items" :key="ix" :name="ix").full-width.q-pa-none.b-0
              item-feed(
                :itemShortOrFull="node"
                :isActive="isActive && currentIndx === ix"
                :isVisible="currentIndx === ix"
                :showHeader="false"
                :showActions="false"
                :showName="false"
                :showSpheres="false")
      // мини-образы
      div(v-if="sameEssenceNodesItemsRes" @click="expanded=true").row.full-width.justify-start.cursor-pointer
        small.text-grey-8.text-weight-thin.q-pl-xs {{$t('На смысл')}}
        small.text-grey-8.text-weight-bolder.text-italic.q-px-xs {{node.name.substring(0, 22)}}{{node.name.length>22 ? '...': ''}}
        small.text-grey-8.text-weight-thin {{$getNoun(sameEssenceNodesItemsRes.items.length,$t('найден'),$t('найдено'),$t('найдено'))}}
        small.text-green-10.text-weight-bolder.q-px-xs {{sameEssenceNodesItemsRes.items.length}}
        small.text-grey-8.text-weight-thin {{$getNoun(sameEssenceNodesItemsRes.items.length, $t('образ'), $t('образа'), $t('образов'))}}
      small(v-else).row.full-width ...
      div(:style=`{position: 'relative', height: previewHeight+'px',  maxWidth: Math.min($q.screen.width, $store.state.ui.pageWidth)+'px', borderRadius: '10px', overflow: 'hidden'}`).row.full-width
        q-btn(:disable="!itemsLeft.length" round flat icon="chevron_left" color="white"
          size="sm" :style=`{zIndex: '100', borderRadius: '10px'}` @click="currentIndx--").absolute-left
        //q-btn(round icon="add" size="sm" color="green" :style=`{borderRadius: '50%', zIndex: '100', opacity: '0.7'}` @click="itemEditorShow=true").absolute-center
        q-virtual-scroll(ref="vs" :items="dotModel" virtual-scroll-horizontal :virtual-scroll-item-size="previewHeight*1.618" :style=`{}`).col
          template(v-slot="{ item, index: itemIndex}")
            div(:style=`{position: 'relative', overflow: 'hidden', height: previewHeight+'px', width: (previewHeight*1.618)+'px', borderRadius: '10px',
                  border: currentIndx === itemIndex ? '2px solid '+$getPaletteColor('green-10') : null,
                  marginLeft: '1px', marginRight: '1px'}`
              @click="currentIndx = itemIndex").row.items-center.center-start.content-center
              div(:style=`{maxHeight: (previewHeight*4)+'px', width: (previewHeight*2)+'px'}`).absolute-center
                item-feed(
                  :itemShortOrFull="sameEssenceNodesItemsRes.items[itemIndex]"
                  :showContext="false"
                  :isActive="false"
                  :isVisible="true"
                  :showHeader="false"
                  :showActions="false"
                  :showName="false"
                  :showSpheres="false")
              div(:style=`{minHeight: '200px', width: '100', background: 'rgba(0,0,0,0.5)', zIndex: '50'}`).fit.absolute
        q-btn(:disable="!itemsRight.length" round flat icon="chevron_right" color="white"
          size="sm" :style=`{zIndex: '100', borderRadius: '10px'}` @click="currentIndx++").absolute-right
    div(v-else-if="sameEssenceNodesItemsRes" :style=`{maxHeight: maxHeight + 'px'}`).scroll.full-width
      q-btn(round flat).full-width
        span.text-white {{$t('Image rating')}}
      list-masonry(v-if="sameEssenceNodesItemsRes" itemKey="oid" :items="[{oid: 'addBtn'}, ...sameEssenceNodesItemsRes.items]")
        template(v-slot:item=`{item, itemIndex}`)
          q-responsive(v-if="item.oid == 'addBtn'" :ratio="16/9" :style=`{borderRadius: ''}`).full-width
            q-btn(round outline no-caps icon="add" color="green" @click="itemEditorShow=true").fit
          div(v-else @click="currentIndx = itemIndex-1, expanded=false").full-width
            item-feed(
              :itemIndex="itemIndex"
              :itemShortOrFull="item"
              :showContext="false"
              :isActive="false"
              :isVisible="true"
              :showHeader="false"
              :showActions="false"
              :showName="false"
              :showSpheres="false"
              :style=`{border: currentIndx === itemIndex-1 ? '2px solid green' : null, borderRadius: '12px'}`)
              template(v-slot:skeleton)
                q-responsive(:ratio="16/9" :style=`{borderRadius: ''}`).full-width
                  q-skeleton(type="QBtn" dark).full-width
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import essenceVoteBall from 'src/components/essence/essence_vote_ball.vue'
import itemEditor from 'src/components/kalpa_item/item_editor'
import essenceSpheres from 'src/components/essence/essence_spheres'
import essenceActions from 'src/components/essence/essence_actions.vue'
import listMasonry from 'src/components/list_masonry/index.vue'

import cloneDeep from 'lodash/cloneDeep'
import debounce from 'lodash/debounce'
import { assert } from 'src/system/common/utils'

export default {
  name: 'pageImages',
  components: {
    essenceVoteBall, itemEditor, essenceSpheres, essenceActions, listMasonry
  },
  props: {
    node: { type: Object },
    isActive: { type: Boolean },
    maxHeight: { type: Number }
  },
  data () {
    return {
      imageHeightReal: null, // вычисляется обзервером
      imageHeight: Math.min(this.$q.screen.width, this.$store.state.ui.pageWidth) / 1.618, // реальный размер образа (заранее не известен. начальное значение - золотое сечение) обновляется через дебаунс чтобы можно было образы листать
      itemEditorShow: false,
      expanded: false,
      sameEssenceNodesItemsRes: null, // ядра с той же сутью
      currentIndx: -1 // индекс текущего ядра в sameEssenceNodesItemsRes.items
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
      if (this.currentIndx >= 0) return this.sameEssenceNodesItemsRes.items.slice(this.currentIndx + 1, this.sameEssenceNodesItemsRes.items.length)
      return []
    },
    itemsLeft () {
      if (this.currentIndx >= 0) return this.sameEssenceNodesItemsRes.items.slice(0, this.currentIndx)
      return []
    },
    length () {
      if (this.sameEssenceNodesItemsRes) return this.sameEssenceNodesItemsRes.items.length
      return 0
    },
    itemWidth () {
      return Math.min(this.$q.screen.width, this.$store.state.ui.pageWidth) / 3
    },
    dotModel () {
      let arr = []
      for (let i = 0; i < this.length; i++) arr.push(i)
      return arr
    },
    previewHeight () {
      return this.$q.screen.height / 18
    }
  },
  watch: {
    'sameEssenceNodesItemsRes.items' (to) {
      // this.$log('sameEssenceNodesItemsRes to', to)
      if (to && this.node) this.currentIndx = to.findIndex(item => item.oid === this.node.oid)
    },
    node (to) {
      // this.$log('node to=', to)
      if (to && this.sameEssenceNodesItemsRes) this.currentIndx = this.sameEssenceNodesItemsRes.items.findIndex(item => item.oid === this.node.oid)
    },
    'node.sphereFromName.oid': {
      immediate: true,
      async handler (to, from) {
        this.sameEssenceNodesItemsRes = null
        this.currentIndx = -1
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
      if (to >= 0) {
        assert(this.sameEssenceNodesItemsRes && this.sameEssenceNodesItemsRes.items[to])
        this.updateImageHeight()
        this.$refs.vs.scrollTo(to, 'center-force')
        let node = await this.$rxdb.get(RxCollectionEnum.OBJ, this.sameEssenceNodesItemsRes.items[to].oid)
        this.$emit('node', node)
      }
    },
    imageHeightReal(to) {
      this.updateImageHeight()
    }
  },
  methods: {},
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
