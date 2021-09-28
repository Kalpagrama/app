<template lang="pug">
  .row.full-width.items-start.content-start.q-px-sm
    q-dialog(
      v-model="itemEditorShow"
      :maximized="false"
      position="standard")
      item-editor(
        :item="newNode"
        :publish="true"
        @close="itemEditorShow=false")
    // заголовок
    .row.full-width
      q-resize-observer(@resize="$event => headerHeight = $event.height")
      .q-pa-sm.text-h6.text-bold.text-white {{$t('Essences')}}
      .col
      q-btn(round flat color="white" icon="clear" @click="$emit('close')")
    //- comments
    .row.full-width.justify-center
      tab-list-feed(
        :scrollAreaHeight="height - headerHeight"
        :type="'quasar'"
        :query="query"
        :itemHeightApprox="60"
        :itemActivePersist="false"
        @count="commentsCount = $event").row.full-width
        template(v-slot:externalHeader)
          q-btn(round outline color="green" icon="add" size="lg" @click="itemEditorShow=true").full-width.q-mb-sm
          ////- essence input
          //div(:style=`{ borderRadius: '10px',}`).row.full-width.items-stretch.content-start.b-35
          //  q-input(
          //    v-model="newEssence"
          //    autogrow dense borderless dark type="textarea" :resize="false"
          //    :placeholder="$t('enter new essence')"
          //    :input-style=`{
          //        resize: 'none',
          //        padding: '10px',
          //        background: 'rgb(45,45,45)',
          //        borderRadius: '10px',
          //      }`
          //    @keyup.enter.ctrl="essenceCreate()").col
          //  q-btn(
          //    flat color="green" icon="send"
          //    :loading="essenceCreateing"
          //    @click="essenceCreate()")
        template(v-slot:item=`{item,itemState,itemIndex,isActive,isVisible,isPreload, scrolling}`)
          div(:style=`{height: '60px', border: '1px solid grey', borderRadius: '10px'}`).row.full-width.items-center.q-mb-sm
            span(:style=`{textAlign: 'center'}`).col {{item.name}}
            essence-vote-ball(:essence="node" :showBottomText="false" @click.native="nodeVoteBallClick").q-pr-sm
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import essenceVoteBall from 'src/components/essence/essence_vote_ball.vue'
import itemEditor from 'src/components/kalpa_item/item_editor'
import cloneDeep from 'lodash/cloneDeep'

export default {
  name: 'pageEssences',
  components: {
    essenceVoteBall, itemEditor
  },
  props: ['node', 'height'],
  data () {
    return {
      newEssence: null,
      essenceCreating: false,
      headerHeight: 0,
      itemEditorShow: false
    }
  },
  watch: {
    itemEditorShow(to) {
      this.$emit('itemEditorShow', to)
    }
  },
  computed: {
    query () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_ITEMS,
          objectTypeEnum: { $in: ['NODE'] },
          oidSphere: this.node.items[0].oid,
          sortStrategy: 'HOT' // 'ACTIVITY', // AGE
        },
        populateObjects: false,
      }
    },
    newNode() {
      let node = cloneDeep(this.node)
      node.name = ''
      return node
    }
  },
  methods: {
  },
  mounted () {
    this.$log('mounted ')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
