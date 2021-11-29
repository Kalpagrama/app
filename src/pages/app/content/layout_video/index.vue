<template lang="pug">
div(
  :style=`{
    position: 'relative',
    height: $q.screen.height+'px',
    overflow: 'hidden',
  }`
  ).column.full-width.bg-black
  //- debug
  //div(
  //  :style=`{
  //    position: 'absolute', zIndex: 10000, top: '0px',
  //    pointerEvents: 'none',
  //    fontSize: '10px',
  //    opacity: 0.8,
  //  }`
  //  ).row.bg-green.text-white.q-pa-xs
  //  small.full-width contentHeightMin: {{ contentHeightMin }}
  ////- debug image
  ////- img(
  //  :src="contentKalpa.thumbUrl"
  //  :style=`{
  //    position: 'absolute', zIndex: 100, top: '0px',
  //    opacity: 0.5,
  //    pointerEvents: 'none',
  //    maxHeight: contentHeightMin+'px',
  //    objectFit: 'contain',
  //  }`
  //  ).full-width.br
  content-player(
    :contentKalpa="contentKalpa"
    :options=`{
      showPult: $q.screen.gt.sm ? true : !pageId,
      showTint: $q.screen.gt.sm ? true : !pageId,
      showPlayBtn: !pageId,
    }`
    @player="playerReady"
    ).fit.bg-black
    template(v-slot:video-footer)
      // кнопки управления образом(когда редактор фрагмента закрыт) (replay pause loop)
      figures-controls(
        v-if="pageId === 'node-editor' && $q.screen.lt.md"
        :player="player" :contentKalpa="contentKalpa"
        :style=`{background: 'rgba(20,20,20,0.5)', borderRadius: '10px'}`)
    //- Desktop page wrapper
    template(v-slot:pult)
      div(
        v-if="player && $q.screen.gt.sm"
        :style=`{
          minHeight: [null,'node','node-editor'].includes(pageId) ? '0px' : '500px',
          maxHeight: 500+'px',
        }`).row.full-width
        component(
          v-if="pageId"
          :is="`page-${pageId}`"
          :contentKalpa="contentKalpa"
          :itemState="{}"
          :player="player"
          @node="nodeFocused"
          @draft="draftFocused"
          @pageId="pageIdChange"
          @close="pageId = null")
        page-node-editor(
          v-if="player.node && player.nodeMode === 'edit'"
          :contentKalpa="contentKalpa"
          :player="player"
          :style=`{
            borderRadius: '10px',
            overflow: 'hidden',
          }`
          @node="nodeFocused")
    //- Mobile page wrapper
    template(v-slot:footer)
      div(
        v-if="pageId && player && $q.screen.lt.md"
        :style=`{height: $q.screen.height-50-contentHeight+'px',}`).row.full-width
        component(
          :is="`page-${pageId}`"
          :contentKalpa="contentKalpa"
          :itemState="{}"
          :player="player"
          @node="nodeFocused"
          @draft="draftFocused"
          @pageId="pageIdChange"
          @close="pageId = null")
      div(
        v-if="player"
        :style=`{position: 'relative'}`).row.full-width
        //- Mobile button overlay
        div(
          v-if="player.nodeMode === 'edit' && $q.screen.lt.md"
          :style=`{position: 'absolute', zIndex: 100, bottom: '0px'}`).row.fit.bg-black.q-px-md
          q-btn(
            v-if="pageId !== 'node-editor'"
            flat color="green" no-caps
            :style=`{
              height: '44px',
              borderRadius: '16px',
            }`
            @click="pageId = 'node-editor'"
            ).full-width
            span.text-bold {{ $t('Next') }}
          q-btn(
            v-if="pageId === 'node-editor'"
            flat color="green" no-caps
            :style=`{
              height: '44px',
              borderRadius: '16px',
            }`
            @click="pageId = null"
            ).full-width
            span.text-bold {{ $t('Edit fragment') }}
        kalpa-menu-mobile(:styles=`{background: 'rgba(50,50,50,0)',}`)
          template(v-slot:all)
            nav-bottom(:pageId="pageId" @pageId="pageIdChange")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import contentPlayer from 'src/components/content_player/index.vue'
import navBottom from 'src/components/kalpa_menu_mobile/nav_bottom.vue'
import pageNodes from './page_nodes/index.vue'
import pageNode from './page_node/index.vue'
import pageNodeEditor from '../node_editor/index.vue'
import pageDrafts from './page_drafts/index.vue'
import pageInfo from '../page_info_root/index.vue'
import figuresControls from 'src/components/content_player/player_video/player_pult/figures_controls.vue'

export default {
  name: 'layoutVideo',
  props: ['contentKalpa', 'draftId'],
  emits: ['notice-check'],
  components: {
    contentPlayer,
    pageNodes,
    pageNode,
    pageNodeEditor,
    pageDrafts,
    pageInfo,
    navBottom,
    figuresControls
  },
  data () {
    return {
      player: null,
      pageId: null,
      contentHeight: 0,
      // contentHeightMin: 0,
    }
  },
  computed: {
    contentHeightMin () {
      let tW = this.contentKalpa.thumbWidth
      let tH = this.contentKalpa.thumbHeight
      let sW = this.$q.screen.width
      let sH = (sW * tH) / tW
      let sHMax = this.$q.screen.height / 3
      let sHMin = 150
      // return sH
      return Math.max(sHMin, Math.min(sH, sHMax))
    },
    queryClusters () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_ITEMS,
          objectTypeEnum: { $in: ['NODE', 'JOINT', 'BLOCK'] },
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
      handler (to, from) {
        if (to) {
          this.$gsap.to(this, 0.3, {contentHeight: this.contentHeightMin})
        }
        else {
          this.$gsap.to(this, 0.3, {contentHeight: this.$q.screen.height})
        }
      }
    },
    'player.nodeMode': {
      handler (to, from) {
        if (to && to === 'edit') {
          this.pageId = null
        }
      }
    }
    // 'player.figures': {
    //   deep: true,
    //   immediate: true,
    //   handler (to, from) {
    //     this.$log('player.figures TO', to)
    //     if (to && !from) {
    //       this.pageId = null
    //       // this.pageId = 'node-editor'
    //     }
    //   }
    // }
  },
  methods: {
    pageIdChange (pageId) {
      this.$log('pageIdChange')
      if (pageId === null) {
        this.pageId = null
        return
      }
      if (this.pageId === pageId) {
        this.pageId = null
      }
      else {
        // TODO: ask for saving the dying node...
        this.player.setState('node', null)
        this.player.setState('nodeMode', null)
        this.pageId = pageId
      }
    },
    nodeFocused (node) {
      this.$log('nodeFocused', node)
      this.pageId = null
      this.player.setState('node', node)
      this.player.setState('nodeMode', 'focus')
    },
    draftFocused (draft) {
      this.$log('draftFocused', draft)
      this.pageId = null
      this.player.setState('node', draft)
      this.player.setState('nodeMode', 'edit')
    },
    async playerReady (player) {
      this.$log('playerReady', this.draft)
      this.player = player
      if (this.draftId) this.draftFocused(await this.$rxdb.get(RxCollectionEnum.WS_ANY, this.draftId))
      // Handle player.autoplay
      this.$nextTick(() => {
        // this.$q.notify('Player.play !')
        // this.player.play()
        // setInterval(() => {
        //   this.player.play()
        // }, 500)
        if (this.$q.platform.is.desktop) this.player.mutedToggle(false)
        this.nodePlay()
      })
      // Get player clusters
      this.clustersRes = await this.$rxdb.find(this.queryClusters)
      // this.$log('clustersRes', this.clustersRes)
      this.player.setState('clusters', this.clustersRes.items)
    },
    async nodePlay () {
      this.$log('nodePlay')
      let nodeOid = this.$store.state.ui.nodeOnContent
      this.$log('nodePlay nodeOid', nodeOid)
      if (nodeOid) {
        // get node
        this.$log('playerReady: nodeOid found, getting node...')
        let node = await this.$rxdb.get(RxCollectionEnum.OBJ, nodeOid)
        this.$log('playerReady: node found, show node in video...', node)
        if (node.items[0] && node.items[0].layers) {
          this.player.setCurrentTime(node.items[0].layers[0].figuresAbsolute[0].t)
          this.player.play()
          this.player.setState('node', node)
          this.player.setState('nodeMode', 'focus')
        }
      }
    },
    onKeydown (e) {
      // this.$log('onKeydown', e)
      if (this.$store.state.ui.userTyping) return
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        this.player.setCurrentTime(this.player.currentTime - 5)
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        this.player.setCurrentTime(this.player.currentTime + 5)
      }
    }
  },
  created () {
    this.$log('created')
    this.contentHeight = this.$q.screen.height
  },
  async mounted () {
    this.$log('mounted')
    window.addEventListener('keydown', this.onKeydown)
    this.$eventBus.$emit('notice-check', 'tutorial_content')
  },
  beforeUnmount () {
    this.$log('beforeDestroy')
    this.$store.commit('ui/stateSet', ['nodeOnContent', null])
    if (this.player) this.player.setState('nodePlaying', null)
    window.removeEventListener('keydown', this.onKeydown)
  }
}
</script>
