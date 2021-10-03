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
      //q-btn(:disable="!itemsLeft.length" stack round flat icon="chevron_left" color="green" :label="itemsLeft.length"
      //  :style=`{zIndex: '50'}`
      //  @click="goto(itemsLeft[itemsLeft.length - 1].oid)").absolute-left
      q-tab-panels(
        v-model="currentIndx"
        :swipeable="true || $q.platform.is.mobile"
        :animated="true || $q.platform.is.mobile"
        dark).full-width
        q-tab-panel(v-for="(node,ix) in sameEssenceNodesItemsRes.items" :key="ix" :name="ix").full-width.q-pa-none
          item-feed(
            :itemShortOrFull="node"
            :isActive="isActive"
            :isVisible="true"
            :showHeader="false"
            :showActions="false"
            :showName="false"
            :showSpheres="false").full-width
      //q-btn(:disable="!itemsRight.length" stack round flat icon="chevron_right" color="green" :label="itemsRight.length"
      //  :style=`{zIndex: '50'}`
      //  @click="goto(itemsRight[0].oid)").absolute-right
    div(v-else-if="sameEssenceNodesItemsRes" :style=`{maxHeight: maxHeight + 'px'}`).scroll.full-width
      q-btn(round flat).full-width
        span.text-white {{$t('Image rating')}}
      list-masonry(v-if="sameEssenceNodesItemsRes" itemKey="oid" :items="[{oid: 'addBtn'}, ...sameEssenceNodesItemsRes.items]")
        template(v-slot:item=`{item, itemIndex}`)
          q-responsive(v-if="item.oid == 'addBtn'" :ratio="16/9" :style=`{borderRadius: ''}`).full-width
            q-btn(round outline icon="add" :label="$t('Add Image')" color="green" @click="itemEditorShow=true").fit
          div(v-else @click="$go(item.oid)").full-width
            item-feed(
              :itemIndex="itemIndex"
              :itemShortOrFull="item"
              :isActive="false"
              :isVisible="true"
              :showHeader="false"
              :showActions="false"
              :showName="false"
              :showSpheres="false"
              :style=`{border: item.oid === node.oid ? '2px solid green' : null, borderRadius: '12px'}`)
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
    }
  },
  methods: {
    handleSwipe (event) {
      this.$log('handleSwipe', event)
    },
    async goto (oid) {
      this.$log('goto', oid)
      let node = await this.$rxdb.get(RxCollectionEnum.OBJ, oid)
      this.$emit('node', node)

      // todo убрать!!! после пролистывания не играет видос, см src/components/composition/from_video/index.vue
      this.isActive = !this.isActive
      await this.$nextTick()
      this.isActive = !this.isActive
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
