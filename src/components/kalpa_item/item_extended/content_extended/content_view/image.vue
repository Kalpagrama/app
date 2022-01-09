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
        //- maxWidth: 600+'px',
        overflow: 'hidden',
      }`
      ).row.fit
        //- node editor mobile
        //transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
        //  div(
        //    v-if="nodeEditorShow && $q.screen.lt.lg"
        //    :style=`{
        //      position: 'absolute', zIndex: 10000, top: '0px',
        //    }`
        //    ).row.full-width
        //    node-editor(
        //      :player="player"
        //      :contentKalpa="content"
        //      :node="player.selectedDraft")
        //- pages
        transition(enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
          div(
            v-if="pageShow"
            :style=`{
            position: 'absolute', top: '0px', left: '0px', zIndex: 900,
            //- background: 'rgba(30,30,30,0.98)',
            borderRadius: '8px',
          }`
          ).row.fit.justify-center
            component(
              :is="`page-${pageId}`"
              :contentKalpa="content"
              :player="player"
              :style=`{
              maxWidth: 600+'px',
              background: 'rgba(30,30,30,0.98)',
            }`
              @draft="onDraftSelected"
              @close="pageId = null")
        //- player
        content-player(
          @player="playerReady"
          :contentKalpa="content"
          :style=`{
          height: '100%',
        }`
          :options=`{
        }`
          :styles=`{
          height: '100%',
        }`
        ).full-width
          template(v-slot:tint-bar=`{tintFocused}`)
            node-editor(
              v-if="nodeEditorShow"
              :player="player"
              :contentKalpa="content"
              :node="player.selectedDraft")
          template(v-slot:footer)
            q-btn(
              @click="footerShow = !footerShow"
              round flat color="white"
              :icon="footerShow ? 'keyboard_arrow_down' : 'keyboard_arrow_up'")
  //- footer
  .row.full-width.justify-center
    kalpa-menu-mobile(v-if="false && mode === 'fullscreen'" :style=`{background: 'rgba(50,50,50,0)',}`)
      template(v-slot:all)
        nav-bottom( v-show="footerShow" :pageId="pageId" :style=`{ maxWidth: 600+'px'}` @pageId="pageId = $event")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import contentPlayer from 'src/components/content_player/index.vue'
import pageNodes from 'src/components/kalpa_item/item_extended/content_extended/page_nodes/image'
import pageDrafts from 'src/components/kalpa_item/item_extended/content_extended/page_drafts/image'
import pageInfo from 'src/components/kalpa_item/item_extended/content_extended/page_info'
import navBottom from 'src/components/kalpa_menu_mobile/nav_bottom.vue'
import nodeEditor from 'src/pages/app/content/node_creator/node_editor/index.vue'

export default {
  name: 'pageContentImage',
  props: ['content', 'mode', 'isActive'],
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
    onDraftSelected (draft) {
      this.$log('onDraftSelected', draft)
      this.player.selectedDraft = draft
      this.pageId = null
    },
    async playerReady (player) {
      this.$log('playerReady')
      this.player = player
      let nodeOid = this.$store.state.ui.nodeOnContent
      if (nodeOid) {
        // get node
        this.$log('playerReady: nodeOid found, getting node...')
        let node = await this.$rxdb.get(RxCollectionEnum.OBJ, nodeOid)
        this.$log('playerReady: node found, show node in image...')
        this.player.setState('nodePlaying', node)
        // await this.player.showItem(node)
        // TODO: showNode/playNode...
      }
    }
  }
}
</script>
