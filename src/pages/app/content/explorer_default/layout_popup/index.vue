<template lang="pug">
div(
  :style=`{
    position: 'relative',
    minHeight: '100vh'
  }`).row.full-width.bg-black
  //- body desktop
  nav-desktop(
    v-if="$q.screen.width >= 1200"
    :pageId="pageId"
    @pageId="pageIdChange"
    :style=`{
      position: 'fixed', zIndex: 1020,
      right: '0px',
      top: ($q.screen.height-350)/2+'px',
      width: '70px',
    }`
    ).row
    div(
      v-if="player && pageId"
      :style=`{
        position: 'absolute', zIndex: 1010,
        top: -(($q.screen.height-350)/2)+60+'px',
        height: $q.screen.height-190+'px',
        left: '-500px', width: '500px',
        //- paddingRight: '70px',
      }`).row
      component(
        :is="`page-${pageId}`"
        :node="node"
        :contentKalpa="contentKalpa"
        :player="player"
        :query="query"
        :height="$q.screen.height-190"
        :style=`{
          //- background: 'rgba(0,0,0,0.5)',
        }`)
  //- body mobile
  div(
    v-if="player && !player.figure && $q.screen.width < 1200"
    :style=`{
      paddingTop: pageId ? contentHeightComputed+'px' : '0px',
    }`
    ).row.full-width
    component(
      :is="`page-${pageId}`"
      :node="node"
      :contentKalpa="contentKalpa"
      :player="player"
      :query="query"
      :height="$q.screen.height-contentHeightComputed"
      @pageId="pageId = $event")
  //- node editor mobile
  transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
    node-editor-popup(
      v-if="player && player.figure && $q.screen.width < 1200"
      :player="player" :contentKalpa="contentKalpa"
      :background="'rgba(30,30,30,0.95)'"
      :style=`{
        position: 'absolute', zIndex: 2000, top: '0px',
      }`).q-pt-sm.q-px-sm
  //- body fixed for all
  div(
    :style=`{
      position: 'fixed', zIndex: 10,
      top: 0+'px',
      height: 'calc('+ contentHeightComputed +'px - env(safe-area-inset-bottom))'
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
      //- template(v-slot:tint=`{tintFocused}`)
      template(v-slot:tint-bar=`{tintFocused}`)
        transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
          node-editor-popup(
            v-if="player && player.figure && $q.screen.gt.xs"
            :player="player" :contentKalpa="contentKalpa"
            :background="'rgba(30,30,30,0.6)'"
            :style=`{
            }`).q-pt-sm.q-px-sm
  //- footer mobile
  div(
    v-if="$q.screen.width < 1200"
    :style=`{position: 'fixed', zIndex: 100, bottom: '0px',}`).row.full-width.justify-center
    div(
      :style=`{
        maxWidth: 600+'px',
        paddingBottom: 'env(safe-area-inset-bottom)',
        borderRadius: '10px 10px 0 0',
      }`).row.full-width.b-40
      nav-mobile(
        v-if="player && !player.figure"
        :contentKalpa="contentKalpa"
        :player="player"
        @pageId="pageIdChange"
        :pageId="pageId"
        :style=`{
          zIndex: 1000,
          borderRadius: '10px 10px 0 0',
        }`).b-40
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import navMobile from '../nav_mobile.vue'
import navDesktop from './nav_desktop.vue'
import contentPlayer from 'components/content_player/index.vue'

import pageNodes from '../page_nodes/index.vue'
import pageDrafts from '../page_drafts/index.vue'
import pageDetails from '../page_details/index.vue'
import pageCreator from '../page_creator/index.vue'
import pageNode from '../page_node/index.vue'

import nodeEditor from './node_editor/index.vue'
import nodeEditorPopup from './node_editor_popup/index.vue'

export default {
  name: 'layoutPopup',
  props: ['contentKalpa', 'query'],
  components: {
    navMobile,
    navDesktop,
    contentPlayer,
    pageNodes,
    pageDrafts,
    pageDetails,
    pageCreator,
    pageNode,
    nodeEditor,
    nodeEditorPopup,
  },
  data () {
    return {
      player: null,
      pageId: null,
      editorHeight: 70,
      clustersRes: null,
    }
  },
  computed: {
    contentHeightComputed () {
      if (this.$q.screen.width >= 1200) {
        return this.$q.screen.height
      }
      else {
        return this.pageId ? this.contentHeight : this.$q.screen.height - 70
      }
    },
    contentHeight () {
      let height = this.contentKalpa.thumbHeight
      let width = this.contentKalpa.thumbWidth
      if (height && width) {
        return Math.max(height, 250)
      }
      else {
        return 300
      }
    },
    editorHeightMin () {
      return 70
    },
    editorHeightMax () {
      return 200
    },
    queryClusters () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_ITEMS,
          objectTypeEnum: { $in: ['NODE', 'JOINT'] },
          // objectTypeEnum: { $in: ['NODE'] },
          oidSphere: this.contentKalpa.oid,
          sortStrategy: 'AGE',
          groupByContentLocation: true
        },
        populateObjects: false,
      }
      return res
    }
  },
  watch: {
    pageId: {
      immediate: true,
      handler (to, from) {
        this.$log('pageId TO', to)
        if (to) {
          // tween contentHeight ?
        }
        else {
          let nodeOid = this.$store.state.ui.nodeOnContent
          if (nodeOid) {
            this.pageId = 'nodes'
          }
        }
      }
    },
    'player.figure': {
      handler (to, from) {
        if (to) {
          this.pageId = null
        }
      }
    }
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
    }
  },
  async mounted () {
    this.$log('mounted')
    // get clusters
    this.clustersRes = await this.$rxdb.find(this.queryClusters, true)
    this.$log('clustersRes', this.clustersRes)
    this.player.setState('clusters', this.clustersRes.items)
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
