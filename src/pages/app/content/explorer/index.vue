<style lang="sass">
.q-header
  background: none !important
  border-radius: 0 0 10px 10px !important
</style>

<template lang="pug">
q-layout(
  view="hHh Lpr lff").b-30
  q-header.b-30
    div(:style=`{}`).row.full-width.justify-center
      //- q-resize-observer(@resize="headerOnResize" :debounce="300")
      transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
        nav-desktop(
          v-if="contentKalpa && $q.screen.gt.sm"
          :contentKalpa="contentKalpa"
          :pageId="pageId"
          @pageId="pageId = $event")
      div(
        :class=`{
          'q-pt-sm': $q.screen.gt.xs
        }`
        :style=`{
          maxWidth: $store.state.ui.pageWidth+'px',
          borderRadius: '0 0 10px 10px',
          //- background: 'rgb(35,35,35)',
        }`).row.full-width.b-30
        node-editor(
          v-if="node"
          @published="nodePublished"
          @node="nodeReset"
          @player="player = $event"
          :node="node"
          :showEditor="node.items[0].layers ? true : false")
  q-footer(
    reveal
    :style=`{
      paddingBottom: 'env(safe-area-inset-bottom)',
      zIndex: 900,
    }`).b-40
    transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
      nav-mobile(
        v-if="contentKalpa && $q.screen.lt.md && !node.items[0].layers"
        :contentKalpa="contentKalpa"
        :pageId="pageId"
        @pageId="pageId = $event"
        :style=`{
          zIndex: 900,
        }`)
  q-page-container
    component(
      v-if="pageId && !node.items[0].layers"
      :is="`page-${pageId}`"
      :node="node"
      :contentKalpa="contentKalpa"
      :player="player"
      @node="node = $event"
      @close="pageId = null")
      content-details(
        :contentKalpa="contentKalpa"
        @page="pageId = $event")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import navDesktop from './nav_desktop.vue'
import navMobile from './nav_mobile.vue'

import contentDetails from './content_details.vue'

import nodeEditor from 'components/node_editor/index.vue'

import pageNodes from './page_nodes/index.vue'
import pageDrafts from './page_drafts/index.vue'
import pageSimilar from './page_similar/index.vue'

export default {
  name: 'contentExplorer',
  props: ['query', 'contentKalpa'],
  components: {
    navDesktop,
    navMobile,
    contentDetails,
    nodeEditor,
    pageNodes,
    pageDrafts,
    pageSimilar,
  },
  data () {
    return {
      node: null,
      nodeTemplate: {
        name: '',
        layout: 'HORIZONTAL',
        items: [],
        vertices: [],
        spheres: [],
        category: 'FUN',
      },
      player: null,
      // headerWidth: 0,
      // headerHeight: 0,
      pageId: 'nodes', // nodes,drafts,contents
    }
  },
  methods: {
    async nodePublished (node) {
      this.$log('nodePublished', node)
      // nodeReset
      let nodeNew = JSON.parse(JSON.stringify(this.nodeTemplate))
      nodeNew.items[0] = JSON.parse(JSON.stringify(this.contentKalpa))
      this.node = nodeNew
      // this.$router.push({query: {node: node.oid}})
    },
    async nodeReset (node) {
      this.$log('nodeReset', node)
      if (this.node.wsItemType === 'WS_NODE') {
        // do nothing...
      }
      else {
        if (confirm('Save node ?')) {
          await this.$rxdb.set(RxCollectionEnum.WS_NODE, this.node)
        }
      }
      this.$set(this, 'node', node)
      this.player.setState('points', [])
      this.player.setState('figures', [])
    },
    headerOnResize (e) {
      this.$log('headerOnResize', e)
      this.headerWidth = e.width
      this.headerHeight = e.height
    }
  },
  created () {
    let nodeNew = JSON.parse(JSON.stringify(this.nodeTemplate))
    nodeNew.items[0] = JSON.parse(JSON.stringify(this.contentKalpa))
    this.node = nodeNew
  }
}
</script>
