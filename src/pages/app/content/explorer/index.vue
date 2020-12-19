<style lang="sass">
.q-header
  background: none !important
  border-radius: 0 0 10px 10px !important
</style>

<template lang="pug">
q-layout(
  view="hHh Lpr lff").b-30
  q-header
    div(:style=`{}`).row.full-width.justify-center
      q-resize-observer(@resize="headerOnResize" :debounce="300")
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
  q-page-container
    page-nodes(
      v-if="!node.items[0].layers && !pageId"
      :nodeQuery="query.node"
      :contentKalpa="contentKalpa"
      :player="player"
      :headerHeight="headerHeight")
      page-details(
        :contentKalpa="contentKalpa"
        :style=`{
          marginTop: '-20px',
          paddingTop: '20px',
        }`
        @page="pageId = $event").q-mb-sm
    component(
      v-if="pageId"
      v-show="!node.items[0].layers"
      :is="`page-${pageId}`"
      :node="node"
      :contentKalpa="contentKalpa"
      :player="player"
      :style=`{
        position: 'fixed', zIndex: 1000, bottom: '0px',
        height: $q.screen.height-headerHeight+'px',
      }`
      @node="node = $event"
      @close="pageId = null")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import nodeEditor from 'components/node_editor/index.vue'
import pageNodes from './page_nodes/index.vue'
import pageDetails from './page_details/index.vue'
import pageDrafts from './page_drafts/index.vue'
import pageContents from './page_contents/index.vue'

export default {
  name: 'contentExplorer',
  props: ['query', 'contentKalpa'],
  components: {
    nodeEditor,
    pageNodes,
    pageDetails,
    pageDrafts,
    pageContents,
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
      headerWidth: 0,
      headerHeight: 0,
      pageId: null, // drafts,contents
    }
  },
  methods: {
    async nodePublished (node) {
      this.$log('nodePublished', node)
      // await this.$wait(300)
      this.$router.push({query: {node: node.oid}})
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
      this.player.stateSet('points', [])
      this.player.stateSet('figures', [])
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
