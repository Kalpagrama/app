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
        transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
          div(
            v-if="player && $q.screen.lt.lg"
            :style=`{
              position: 'absolute', zIndex: 10000, top: '0px',
            }`
            ).row.full-width.q-pa-sm
            node-editor(
              :player="player"
              :contentKalpa="contentKalpa")
        //- pages
        transition(enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
          div(
            v-if="pageId && player && !player.figure"
            :style=`{
              position: 'absolute', top: '0px', left: '0px', zIndex: 900,
              //- background: 'rgba(30,30,30,0.98)',
              borderRadius: '8px',
            }`
            ).row.fit.justify-center
            component(
              :is="`page-${pageId}`"
              :contentKalpa="contentKalpa"
              :player="player"
              :style=`{
                maxWidth: 600+'px',
                background: 'rgba(30,30,30,0.98)',
              }`
              @close="pageId = null")
        //- node creator
        //- div(
          v-if="player && !pageId"
          :style=`{
            position: 'absolute', zIndex: 10000, bottom: '0px',
          }`
          ).row.full-width.q-px-sm
          node-editor(
            :player="player"
            :contentKalpa="contentKalpa")
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
          template(v-slot:tint-bar=`{tintFocused}`)
            node-editor(
              v-if="player && !pageId && $q.screen.gt.md"
              :player="player"
              :contentKalpa="contentKalpa")
          template(v-slot:footer)
            q-btn(
              @click="footerShow = !footerShow"
              round flat color="white"
              :icon="footerShow ? 'keyboard_arrow_down' : 'keyboard_arrow_up'")
  //- footer
  .row.full-width.justify-center
    nav-bottom(
      v-show="footerShow"
      :pageId="pageId"
      :style=`{
        maxWidth: 600+'px',
      }`
      @pageId="pageId = $event")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import contentPlayer from 'src/components/content_player/index.vue'

import pageNodes from './page_nodes/index.vue'
// import pageDrafts from './page_drafts/index.vue'
import pageInfo from '../page_info_root/index.vue'
import navBottom from '../nav_bottom.vue'

import nodeEditor from 'src/pages/app/content/node_creator/node_editor/index.vue'

export default {
  name: 'layoutImage',
  props: ['contentKalpa'],
  components: {
    contentPlayer,
    pageNodes,
    // pageDrafts,
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
        this.$log('playerReady: node found, show node in image...')
        this.player.setState('nodePlaying', node)
        // await this.player.showItem(node)
        // TODO: showNode/playNode...
      }
    }
  }
}
</script>
