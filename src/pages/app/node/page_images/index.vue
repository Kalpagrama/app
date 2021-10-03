// образы на суть
<template lang="pug">
  div(:style=`{position: 'relative'}`).row.full-width
    q-btn(round flat :icon="expanded ? 'expand_less' : 'expand_more'" color="white" :style=`{zIndex: '100'}` @click="expanded=!expanded").absolute-top-right
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
    item-feed(v-if="!expanded"
      :itemShortOrFull="node"
      :isActive="isActive"
      :isVisible="true"
      :showHeader="false"
      :showActions="false"
      :showName="false"
      :showSpheres="false")
      //q-btn(:disable="!itemsRight.length" stack round flat icon="chevron_right" color="green" :label="itemsRight.length":style=`{}`).absolute-right.z-top.br
      //q-btn(:disable="!itemsLeft.length" stack round flat icon="chevron_left" color="green" :label="itemsLeft.length").absolute-left.z-top.br
      //q-btn(stack round flat icon="add" no-caps color="green" :label="$t('add reflection')" @click="itemEditorShow=true").absolute-top-right.z-top
    div(v-else-if="sameEssenceNodesItemsRes" :style=`{maxHeight: maxHeight + 'px'}`).scroll.full-width
        .row.full-width.q-col-gutter-sm
          .col-4
            q-btn(round outline icon="add" color="green" @click="itemEditorShow=true").fit
          div(
            v-for="(sameEssenceNode, ix) in sameEssenceNodesItemsRes.items" :key="sameEssenceNode.oid"
            @click="$go('/node/'+sameEssenceNode.oid)").col-4
            item-feed(
              :itemIndex="ix"
              :itemShortOrFull="sameEssenceNode"
              :isActive="false"
              :isVisible="true"
              :showHeader="false"
              :showActions="false"
              :showName="false"
              :showSpheres="false"
              :style=`{border: sameEssenceNode.oid === node.oid ? '2px solid green' : null, borderRadius: '12px'}`)
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
import cloneDeep from 'lodash/cloneDeep'

export default {
  name: 'pageImages',
  components: {
    essenceVoteBall, itemEditor, essenceSpheres, essenceActions
  },
  props: ['node', 'isActive', 'maxHeight'],
  data () {
    return {
      itemEditorShow: false,
      expanded: false,
      sameEssenceNodesItemsRes: null // ядра с той же сутью
    }
  },
  computed: {
    newNode () {
      if (!this.node) return null
      let node = cloneDeep(this.node)
      node.items = []
      node.spheres = []
      return node
    },
    itemsRight () {
      if (!this.sameEssenceNodesItemsRes) return []
      let indxCurrent = this.sameEssenceNodesItemsRes.items.find(item => item.oid === this.node.oid)
      if (indxCurrent >= 0) return this.sameEssenceNodesItemsRes.items.slice(indxCurrent, this.sameEssenceNodesItemsRes.items.length)
      return []
    },
    itemsLeft () {
      if (!this.sameEssenceNodesItemsRes) return []
      let indxCurrent = this.sameEssenceNodesItemsRes.items.find(item => item.oid === this.node.oid)
      if (indxCurrent >= 0) return this.sameEssenceNodesItemsRes.items.slice(0, indxCurrent)
      return []
    },
    length () {
      if (this.sameEssenceNodesItemsRes) return this.sameEssenceNodesItemsRes.items.length
      return 0
    },
    itemWidth(){
      return Math.min(this.$q.screen.width, this.$store.state.ui.pageWidth) / 3
    }
  },
  watch: {
    'sameEssenceNodesItemsRes.items'(to) {
      this.$log('sameEssenceNodesItemsRes to', to)
    },
    // sameEssenceNodesItemsRes: {
    //   deep: true,
    //   handler(to, from){
    //     this.$log('sameEssenceNodesItemsRes deep to', to)
    //   }
    // }
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
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
