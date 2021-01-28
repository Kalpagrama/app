<template lang="pug">
q-layout(
  view="hHh Lpr lff").bg-black
  //- header: content player
  q-header(:style=`{opacity: 1,}`).bg-black
    .row.full-width.justify-center
      div(
        :style=`{
          position: 'relative',
          height: 'calc('+ contentHeight +'px - env(safe-area-inset-top))',
          //- height: contentHeight+'px',
          maxWidth: contentWidth+'px',
          borderRadius: '0 0 10px 10px',
        }`
        ).column.full-width.bg-black
        div(:style=`{position: 'relative',}`).col
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
  //- footer: navigation
  q-footer(reveal)
    div(
      :style=`{
        //- paddingBottom: 'env(safe-area-inset-bottom)',
      }`
      ).row.full-width.justify-center
      div(
        :style=`{
          borderRadius: '10px 10px 0 0',
          maxWidth: $store.state.ui.pageWidth+'px',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }`
        ).row.full-width.b-40
        nav-mobile(
          v-if="player && !player.figure"
          @pageId="pageIdChange"
          :pageId="pageId"
          :style=`{
            zIndex: 1000,
          }`)
        //- v-touch-pan.prevent.mouse="footerHeight === footerHeightMax ? null : footerOnPan"
        node-editor(
          v-if="player && player.figure"
          :player="player"
          :contentKalpa="contentKalpa"
          :isMini="footerHeight === 70"
          @toggle="footerToggle"
          @nodePublished="nodePublished"
          :style=`{
            height: footerHeight+'px',
          }`)
  //- pages or node creator...
  q-page-container
    q-page(
      :style=`{
      }`).row.full-width.justify-center
      div(
        v-if="contentKalpa && player"
        :style=`{
          position: 'relative',
          maxWidth: $store.state.ui.pageWidth+'px',
          borderRadius: '10px 10px 0 0',
        }`
        ).row.full-width.items-start.content-start.b-30
        component(
          :is="`page-${pageId}`"
          :node="node"
          :contentKalpa="contentKalpa"
          :player="player"
          :query="query"
          :height="$q.screen.height-contentHeight-70")
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
      player: null,
      contentHeight: 0,
      contentWidth: 0,
      footerHeight: 70,
      pageId: null,
      node: {
        name: '',
        spheres: []
      }
    }
  },
  computed: {
    contentHeightMin () {
      return this.$q.screen.height / 3
    },
    contentHeightMax () {
      return this.$q.screen.height - 70
    },
    contentWidthMin () {
      return Math.min(this.$q.screen.width, 700)
    },
    contentWidthMax () {
      return this.$q.screen.width
    },
    footerHeightMax () {
      return this.$q.screen.height * 0.66
    },
    footerHeightMin () {
      return 70
    }
  },
  watch: {
    pageId: {
      immediate: true,
      handler (to, from) {
        if (to) {
          this.$tween.to(this, 0.3, {
            contentHeight: this.contentHeightMin,
            contentWidth: this.contentWidthMax,
          })
        }
        else {
          this.$tween.to(this, 0.3, {
            contentHeight: this.contentHeightMax,
            contentWidth: this.contentWidthMax
          })
        }
      }
    },
    'player.figure': {
      handler (to, from) {
        if (to && !from) {
          this.$log('player.figure Start creating node, pageId = null')
          this.pageId = null
        }
        if (to === null) {
          // this.pageId = null
          if (this.footerHeight !== 70) {
            this.footerToggle()
          }
        }
        // if (to === null) {}
      }
    }
  },
  methods: {
    footerOnPan (e) {
      // this.$log('footerOnPan', e.delta.y)
      let footerHeight = this.footerHeight - e.delta.y
      if (footerHeight > this.footerHeightMax) footerHeight = this.footerHeightMax
      this.$log('footerOnPan footerHeight', footerHeight)
      this.footerHeight = footerHeight
      if (e.isFinal) {
        if (this.footerHeight > this.footerHeightMax / 2) {
          this.footerHeight = this.footerHeightMax
        }
        else {
          this.footerHeight = this.footerHeightMin
        }
      }
    },
    footerToggle (e) {
      this.$log('footerToggle', e)
      let footerHeight = this.footerHeight === 70 ? this.footerHeightMax : this.footerHeightMin
      // let contentHeight = this.footerHeight === 70 ? this.contentHeightMin : this.contentHeightMax
      let contentHeight = () => {
        if (this.footerHeight === 70) {
          // return this.$q.screen.height - this.footerHeightMax + 100
          return this.$q.screen.height - this.footerHeightMax
        }
        else {
          return this.contentHeightMax
        }
      }
      this.$tween.to(this, 0.3, {
        footerHeight: footerHeight,
        contentHeight: contentHeight(),
        onComplete: () => {
          this.$log('footerToggle DONE')
        }
      })
    },
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
      this.pageId = 'nodes'
    },
    nodeSaved () {
      this.$log('nodeSaved')
      this.pageId = 'drafts'
    },
    nodeClosed () {
      this.$log('nodeClosed')
      this.pageId = null
    },
    nodeDelete () {
      this.$log('nodeDelete')
      this.player.setState('figure', null)
      this.$tween.to(this, 0.3, {
        contentHeight: this.contentHeightMax,
        contentWidth: this.contentWidthMax
      })
    }
  }
}
</script>
