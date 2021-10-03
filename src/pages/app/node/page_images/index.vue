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
    div(v-if="sameEssenceNodesItemsRes && !expanded" ).row.full-width.position-relative
      q-tab-panels(
        v-model="currentIndx"
        :swipeable="true || $q.platform.is.mobile"
        :animated="true || $q.platform.is.mobile"
        dark).full-width
        q-tab-panel(v-for="(node,ix) in sameEssenceNodesItemsRes.items" :key="ix" :name="ix").full-width.q-pa-none
          item-feed(
            :itemShortOrFull="node"
            :isActive="isActive && currentIndx === ix"
            :isVisible="currentIndx === ix"
            :showHeader="false"
            :showActions="false"
            :showName="false"
            :showSpheres="false")
      // мини-образы
      div(:style=`{position: 'relative', maxWidth: Math.min($q.screen.width, $store.state.ui.pageWidth)+'px'}`).row.full-width
        q-btn(:disable="!itemsLeft.length" stack round flat icon="chevron_left" color="white" :label="itemsLeft.length"
          size="sm" :style=`{zIndex: '100'}` @click="currentIndx--").absolute-left
        q-virtual-scroll(ref="vs" :items="dotModel" virtual-scroll-horizontal :style=`{}`).col
          template(v-slot="{ item, index: itemIndex}")
            div(
              :style=`{ overflow: 'hidden', height: '50px', borderRadius: '10px',
                  border: currentIndx === itemIndex ? '2px solid green' : null,
                  position: 'relative'
               }`
              @click="currentIndx = itemIndex"
              ).row.items-center.center-start.content-center.q-mx-xs
              div(:style=`{maxHeight: '200px', width: '80px'}`)
                item-feed(
                  :itemShortOrFull="sameEssenceNodesItemsRes.items[itemIndex]"
                  :isActive="false"
                  :isVisible="true"
                  :showHeader="false"
                  :showActions="false"
                  :showName="false"
                  :showSpheres="false"
                  :styles=`{}`)
              div(:style=`{minHeight: '200px', width: '100', background: 'rgba(0,0,0,0.5)', zIndex: '50'}`).fit.absolute
        q-btn(:disable="!itemsRight.length" stack round flat icon="chevron_right" color="white" :label="itemsRight.length"
          size="sm" :style=`{zIndex: '100'}` @click="currentIndx++").absolute-right
    div(v-else-if="sameEssenceNodesItemsRes" :style=`{maxHeight: maxHeight + 'px'}`).scroll.full-width
      q-btn(round flat).full-width
        span.text-white {{$t('Image rating')}}
      list-masonry(v-if="sameEssenceNodesItemsRes" itemKey="oid" :items="[{oid: 'addBtn'}, ...sameEssenceNodesItemsRes.items]")
        template(v-slot:item=`{item, itemIndex}`)
          q-responsive(v-if="item.oid == 'addBtn'" :ratio="16/9" :style=`{borderRadius: ''}`).full-width
            q-btn(round outline icon="add" :label="$t('Add Image')" color="green" @click="itemEditorShow=true").fit
          div(v-else @click="currentIndx = itemIndex-1, expanded=false").full-width
            item-feed(
              :itemIndex="itemIndex"
              :itemShortOrFull="item"
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
        //.row.full-width.q-col-gutter-sm
        //  .col-4
        //    q-btn(round outline icon="add" color="green" @click="itemEditorShow=true").fit
        //  div(
        //    v-for="(sameEssenceNode, ix) in sameEssenceNodesItemsRes.items" :key="sameEssenceNode.oid"
        //    @click="$go('/node/'+sameEssenceNode.oid)").col-4
        //    item-feed(
        //      :itemIndex="ix"
        //      :itemShortOrFull="sameEssenceNode"
        //      :isActive="false"
        //      :isVisible="true"
        //      :showHeader="false"
        //      :showActions="false"
        //      :showName="false"
        //      :showSpheres="false"
        //      :style=`{border: sameEssenceNode.oid === node.oid ? '2px solid green' : null, borderRadius: '12px'}`)
        //      template(v-slot:skeleton)
        //        q-responsive(:ratio="16/9" :style=`{borderRadius: ''}`).full-width
        //          q-skeleton(type="QBtn" dark).full-width
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import essenceVoteBall from 'src/components/essence/essence_vote_ball.vue'
import itemEditor from 'src/components/kalpa_item/item_editor'
import essenceSpheres from 'src/components/essence/essence_spheres'
import essenceActions from 'src/components/essence/essence_actions.vue'
import listMasonry from 'src/components/list_masonry/index.vue'

import cloneDeep from 'lodash/cloneDeep'
import { assert } from 'src/system/common/utils'

export default {
  name: 'pageImages',
  components: {
    essenceVoteBall, itemEditor, essenceSpheres, essenceActions, listMasonry
  },
  props: ['node', 'isActive', 'maxHeight'],
  data () {
    return {
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
    async currentIndx (to) {
      if (to >= 0) {
        assert(this.sameEssenceNodesItemsRes && this.sameEssenceNodesItemsRes.items[to])
        this.$refs.vs.scrollTo(to, 'center-force')
        let node = await this.$rxdb.get(RxCollectionEnum.OBJ, this.sameEssenceNodesItemsRes.items[to].oid)
        this.$emit('node', node)
      }
    }
  },
  methods: {
    handleSwipe (event) {
      this.$log('handleSwipe', event)
    }
  },
  async created () {
    this.$log('created ')
    this.sameEssenceNodesItemsRes = await this.$rxdb.find({
      selector: {
        rxCollectionEnum: RxCollectionEnum.LST_SPHERE_ITEMS,
        objectTypeEnum: { $in: ['NODE'] },
        oidSphere: this.node.sphereFromName.oid,
        sortStrategy: 'ESSENTIALLY' // 'ACTIVITY', // AGE
      },
      populateObjects: false
    })
    this.$nextTick(() => {
      this.$log('itemsRight', this.itemsRight)
      this.$log('itemsLeft', this.itemsLeft)
      this.$log('currentIndx', this.currentIndx)
      this.$log('length', this.length)
    })
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
