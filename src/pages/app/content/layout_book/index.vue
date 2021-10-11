<template lang="pug">
div(
  :style=`{
    position: 'relative',
    height: $q.screen.height+'px',
  }`
  ).column.full-width
  //- body
  .col.full-width
    div(
      :style=`{
        position: 'relative',
      }`
      ).row.fit.justify-center
      div(
        :style=`{
          position: 'relative',
          maxWidth: 650+'px',
          overflow: 'hidden',
        }`
        ).row.fit
        //- pages
        transition(enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
          div(
            v-if="pageShow"
            :style=`{
              position: 'absolute', top: '0px', left: '0px', zIndex: 900,
              background: 'rgba(30,30,30,0.98)',
              borderRadius: '8px',
            }`
            ).row.fit
            component(
              :is="`page-${pageId}`"
              :contentKalpa="contentKalpa"
              :player="player"
              :style=`{
              }`
              @close="pageId = null")
        //- node creator
        transition(enter-active-class="animated slideInUp")
          div(
            v-if="nodeEditorShow"
            :style=`{
              position: 'absolute', zIndex: 1000, bottom: '50px',
            }`
            ).row.full-width
            node-editor(
              :showColor="true"
              :player="player"
              :contentKalpa="contentKalpa"
              :node="player.selectedDraft"
              :style=`{border: '3px solid #222', borderRadius: '10px'}`
              ).b-40
        //- player
        content-player(
          @player="playerReady"
          :contentKalpa="contentKalpa"
          :style=`{
            height: '100%',
          }`
          :options=`{
          }`
          :styles=`{
            height: '100%',
          }`
          ).full-width
          template(v-slot:footer)
            q-btn(
              @click="footerShow = !footerShow"
              round flat color="white"
              :icon="footerShow ? 'keyboard_arrow_down' : 'keyboard_arrow_up'")
  //- footer
  .row.full-width.justify-center
    kalpa-menu-mobile(:style=`{background: 'rgba(50,50,50,0)',}`)
      template(v-slot:all)
        nav-bottom(
          v-show="footerShow"
          :style=`{maxWidth: 650+'px'}`
          :pageId="pageId" @pageId="pageId = $event").row.full-width.justify-center
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import contentPlayer from 'src/components/content_player/index.vue'

import pageNodes from './page_nodes/index.vue'
import pageDrafts from './page_drafts/index.vue'
import pageInfo from '../page_info_root/index.vue'
import navBottom from 'src/components/kalpa_menu_mobile/nav_bottom.vue'

import nodeEditor from 'src/pages/app/content/node_creator/node_editor/index.vue'
import { assert } from 'src/system/common/utils'

export default {
  name: 'layoutBook',
  props: ['contentKalpa'],
  components: {
    contentPlayer,
    pageNodes,
    pageDrafts,
    pageInfo,
    navBottom,
    nodeEditor,
  },
  data () {
    return {
      player: null,
      pageId: null,
      footerShow: true,
    }
  },
  computed: {
    nodeEditorShow() {
      return this.player && this.player.selectedDraft && !this.pageId
    },
    pageShow() {
      return this.pageId && !this.nodeEditorShow
    }
   },
  methods: {
    async playerReady (player) {
      this.$log('playerReady')
      this.player = player
      let nodeOid = this.$store.state.ui.nodeOnContent
      if (nodeOid) {
        // get node
        this.$log('playerReady: nodeOid found, getting node...')
        let node = await this.$rxdb.get(RxCollectionEnum.OBJ, nodeOid)
        this.$log('playerReady: node found, show node in book...')
        await this.player.showItem(node)
        this.player.setState('nodePlaying', node)
      }
    },
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
