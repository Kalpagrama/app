// сути на образ
<template lang="pug">
  .row.full-width.items-start.content-start
    q-dialog(
      v-model="itemEditorShow"
      :maximized="false"
      position="standard")
      item-editor(
        :item="newNode"
        :publish="true"
        @close="itemEditorShow=false")
    q-dialog(
      v-model="itemPreviewShow"
      :maximized="false"
      position="standard"
      @hide="$emit('itemEditorShow', false)"
      @show="$emit('itemEditorShow', true)"
      )
      item-feed(
        :isActive="true"
        :isVisible="true"
        :itemState="selectedEssenceState"
        :itemShortOrFull="selectedEssence"
        :style=`{ maxWidth: $store.state.ui.pageWidth - 50+'px'}`)
    // заголовок
    //.row.full-width
    //  q-resize-observer(@resize="$event => headerHeight = $event.height")
    //  .q-pa-sm.text-h6.text-bold.text-white {{$t('Essence list')}}
    //  .col
    //  q-btn(round flat color="white" icon="clear" @click="$emit('close')")
    div(:style=`{position: 'relative'}`).row.full-width.items-center.justify-between.q-px-md
      span.text-grey {{$t('essence rating')}}
      q-btn(round flat no-caps icon="add" color="green" @click="itemEditorShow=true").col-3
      q-btn(round flat color="white" icon="clear" @click="$emit('close')")
    //- comments
    .row.full-width.justify-center
      tab-list-feed(
        ref="listFeed"
        :scrollAreaHeight="height - headerHeight"
        :type="'quasar'"
        :query="query"
        :itemHeightApprox="60"
        :itemActivePersist="false"
        @items="essenceList = $event").row.full-width
        template(v-slot:externalHeader)
          //q-btn(round outline color="green" icon="add" size="lg" @click="itemEditorShow=true").full-width.q-mb-sm
          //item-editor(
          //  :item="newNode"
          //  :showHeader="false"
          //  :showItems="false"
          //  :publish="true"
          //  @close="resetNewNode()").row.full-width
        template(v-slot:item=`{item: node,itemState,itemIndex,isActive,isVisible,isPreload, scrolling}`)
          .row.full-width.q-px-md
            div(:style=`{minHeight: '40px', border: '1px solid ' + (currentIndx === itemIndex ? 'green' : 'grey'), borderRadius: '10px'}`).cursor-pointer.row.full-width.items-center.q-mb-sm
              div(v-if="true || !node.spheres" @click="$go('/node/'+node.oid), $emit('close')").row.full-width.q-pa-xs
                span(:style=`{textAlign: 'center'}`).col {{node.name}}
                q-circular-progress(v-if="node.countVotes > 1" :value="node.rate" :min="0" :max="maxRate" show-value dark size="sm" color="green" :thickness="0.09" track-color="grey-9"
                  @click="/*selectedEssence=node,selectedEssenceState=itemState, itemPreviewShow=true*/")
                  span {{node.countVotes}}
              div(v-else :style=`{position: 'relative'}`).row.full-width
                essence-spheres(v-if="node.spheres.length > 0" :node="node" :itemState="itemState").row.full-width
                // суть
                .row.full-width
                  // author
                  q-btn(:to="'/user/'+node.author.oid" size="sm" round flat color="grey" no-caps padding="none").q-pr-md
                    q-avatar(:size="'20px'")
                      img(:src="node.author.thumbUrl" :to="'/user/'+node.author.oid")
                    span() {{node.author.name}}
                  // essence
                  .row.col.justify-center
                    span(:style=`{fontSize: fontSize+'px', textAlign: 'center', position: 'relative'}` @click="$go('/node/'+node.oid), $emit('close')").text-white.cursor-pointer {{node.name}}
                essence-actions(v-if="expandedItemIndex===itemIndex"
                  :essence="node"
                  :itemState="itemState"
                  :nodeBackgroundColor="'rgb(30,30,30)'"
                  :nodeActionsColor="'rgb(200,200,200)'"
                  :isActive="true"
                  :isVisible="true").row.full-width
                q-btn(round flat dense :icon="expandedItemIndex===itemIndex ? 'expand_less' : 'expand_more'" color="white" @click="expandedItemIndex!==itemIndex ? expandedItemIndex=itemIndex : expandedItemIndex=null").absolute-top-right
  </template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import essenceVoteBall from 'src/components/essence/essence_vote_ball.vue'
import itemEditor from 'src/components/kalpa_item/item_editor'
import essenceSpheres from 'src/components/essence/essence_spheres'
import essenceActions from 'src/components/essence/essence_actions.vue'
import cloneDeep from 'lodash/cloneDeep'

export default {
  name: 'pageEssences',
  components: {
    essenceVoteBall, itemEditor, essenceSpheres, essenceActions
  },
  props: ['node', 'height'],
  data () {
    return {
      newEssence: null,
      essenceCreating: false,
      headerHeight: 0,
      itemEditorShow: false,
      itemPreviewShow: false,
      essenceList: [],
      selectedEssence: null,
      selectedEssenceState: null,
      expandedItemIndex: null,
    }
  },
  watch: {
    currentIndx(to) {
      this.$log('currentIndx to:', to)
      this.$refs.listFeed.scrollTo(to)
    }
  },
  computed: {
    query () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_ITEMS,
          objectTypeEnum: { $in: ['NODE'] },
          oidSphere: this.node.items[0].oid,
          sortStrategy: 'ESSENTIALLY' // 'ACTIVITY', // AGE
        },
        populateObjects: false,
      }
    },
    newNode() {
      this.$log('resetNewNode ')
      let node = cloneDeep(this.node)
      node.name = ''
      node.description = ''
      node.spheres = []
      return node
    },
    maxRate () {
      if (this.essenceList) return this.essenceList.reduce((acc, v) => acc > v.rate ? acc : v.rate)
      return 0
    },
    currentIndx(){
      if (this.essenceList) return this.essenceList.findIndex(item => item.oid === this.node.oid)
      return -1
    }
  },
  methods: {
  },
  created () {
    this.$log('created ')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
