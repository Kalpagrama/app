<template lang="pug">
div(
  :style=`{
    position: 'relative',
    minHeight: '100vh'
  }`).row.full-width.bg-black
  //- body
  div(
    v-if="player && !player.figure"
    :style=`{
      paddingTop: pageId ? $q.screen.height/3+'px' : '0px',
    }`
    ).row.full-width
    component(
      :is="`page-${pageId}`"
      :node="node"
      :contentKalpa="contentKalpa"
      :player="player"
      :query="query"
      :height="$q.screen.height-70")
  //- header
  div(
    :style=`{
      position: 'fixed', zIndex: 10,
      top: offsetTop+'px',
      height: pageId ? $q.screen.height/3+'px' : 'calc('+($q.screen.height-70)+'px - env(safe-area-inset-bottom))',
    }`).row.full-width
    content-player(
      @player="player = $event"
      :contentKalpa="contentKalpa"
      :style=`{
        height: '100%',
      }`
      :options=`{
        showHeader: false,
        showBar: true,
        showFooter: true,
        mode: 'editor',
      }`
      :styles=`{
        height: '100%',
        objectFit: 'contain',
      }`
      ).full-width.bg-black
  //- footer
  div(:style=`{position: 'fixed', zIndex: 100, bottom: '0px',}`).row.full-width.justify-center
    div(
      :style=`{
        maxWidth: $store.state.ui.pageWidth+'px',
        paddingBottom: 'env(safe-area-inset-bottom)',
        borderRadius: '10px 10px 0 0',
      }`).row.full-width.b-40
      nav-mobile(
        v-if="player && !player.figure"
        @pageId="pageIdChange"
        :pageId="pageId"
        :style=`{
          zIndex: 1000,
          borderRadius: '10px 10px 0 0',
        }`).b-40
      node-editor(
        v-if="player && player.figure"
        :player="player"
        :contentKalpa="contentKalpa"
        @toggle="editorHeight === 70 ? editorHeight = 200 : editorHeight = 70"
        :isOpened="editorHeight === 200"
        :style=`{
          height: editorHeight+'px',
          borderRadius: '10px 10px 0 0',
        }`).b-40
</template>

<script>
import navMobile from '../nav_mobile.vue'
import contentPlayer from 'components/content_player/index.vue'

import pageNodes from '../page_nodes/index.vue'
import pageDrafts from '../page_drafts/index.vue'
import pageDetails from '../page_details/index.vue'
import pageCreator from '../page_creator/index.vue'
import pageNode from '../page_node/index.vue'

import nodeEditor from './node_editor/index.vue'

export default {
  name: 'layoutPopup',
  props: ['contentKalpa', 'query'],
  components: {
    navMobile,
    contentPlayer,
    pageNodes,
    pageDrafts,
    pageDetails,
    pageCreator,
    pageNode,
    nodeEditor,
  },
  data () {
    return {
      offsetTop: 0,
      player: null,
      pageId: null,
      editorHeight: 70
    }
  },
  computed: {
    editorHeightMin () {
      return 70
    },
    editorHeightMax () {
      return 200
    }
  },
  watch: {
  },
  methods: {
    pageIdChange (pageId) {
      this.$log('pageIdChange', pageId)
      if (this.pageId === pageId) {
        this.pageId = null
      }
      else {
        this.pageId = pageId
      }
    },
    nodePublished () {
      this.$log('nodePublished')
      // this.pageId = 'nodes'
    },
    nodeSaved () {
      this.$log('nodeSaved')
      // this.pageId = 'drafts'
    },
    nodeClosed () {
      this.$log('nodeClosed')
      // this.pageId = null
    },
    nodeDelete () {
      this.$log('nodeDelete')
      // this.player.setState('figure', null)
      // this.$tween.to(this, 0.3, {
      //   contentHeight: this.contentHeightMax,
      //   contentWidth: this.contentWidthMax
      // })
    }
  },
  mounted () {
    this.$log('mounted')
    window.visualViewport.addEventListener('resize', (e) => {
      const viewport = window.visualViewport
      this.offsetTop = viewport.offsetTop
      window.scrollTop = viewport.offsetTop
    })
  }
}
</script>
