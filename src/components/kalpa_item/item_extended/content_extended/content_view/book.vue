<template lang="pug">
.row.full-width
  div(v-if="!readerMode").row.full-width.justify-center
    img(
        :src="content.thumbUrl"
        :style=`{height: $q.screen.height/2+'px', objectFit: 'contain',}`
      ).full-width.br-10
    q-btn(flat outline color="green-8" :label="$t('читать')" @click="readerMode=true")
  div(v-else :style=`{height: options.maxHeight+'px'}`).row.full-width.relative-position
    //- body
    .row.fit
      .row.fit.justify-center.relative-position
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
                :contentKalpa="content"
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
                :contentKalpa="content"
                :node="player.selectedDraft"
                :style=`{border: '3px solid #222', borderRadius: '10px'}`
              ).b-40
          //- player
          content-player(
            @player="playerReady"
            :contentKalpa="content"
            :style=`{
              height: '100%',
            }`
            :styles=`{
            height: '100%',
          }`
          ).full-width
    //- footer
    .row.full-width.justify-center
      kalpa-menu-mobile(v-if="false" :style=`{background: 'rgba(50,50,50,0)',}`)
        template(v-slot:all)
          nav-bottom(:style=`{maxWidth: 650+'px'}` :pageId="pageId" @pageId="pageId = $event").row.full-width.justify-center
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import contentPlayer from 'src/components/content_player/index.vue'

import pageNodes from 'src/components/kalpa_item/item_extended/content_extended/page_nodes/book'
import pageDrafts from 'src/components/kalpa_item/item_extended/content_extended/page_drafts/book'
import pageInfo from 'src/components/kalpa_item/item_extended/content_extended/page_info'
import navBottom from 'src/components/kalpa_menu_mobile/nav_bottom.vue'

import nodeEditor from 'src/components/kalpa_item/item_extended/content_extended/node_editor/book/index.vue'
import { assert } from 'src/system/common/utils'
export default {
  name: 'pageContentBook',
  props: ['content', 'options'],
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
      readerMode: false,
      player: null,
      pageId: null,
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
      // this.player.setState('isFullscreen', true)
      let nodeOid = this.$store.state.ui.nodeOnContent
      if (nodeOid) {
        // get node
        this.$log('playerReady: nodeOid found, getting node...')
        let node = await this.$rxdb.get(RxCollectionEnum.OBJ, nodeOid)
        this.$log('playerReady: node found, show node in book...')
        await this.player.showItem(node)
        this.player.setState('nodePlaying', node)
      }
      this.$emit('player', player)
    },
  },
  mounted () {
    this.$log('mounted')
  },
  beforeUnmount () {
    this.$log('beforeDestroy')
  }
}
</script>
