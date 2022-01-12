// образы на суть
<template lang="pug">
.column.full-width
  .col.full-width.relative-position
    content-player( @player="playerReady" :contentKalpa="content" :options="{showTint: true, maxHeight: mode.in('fullscreen','fullscreenEditor')?$q.screen.height:$q.screen.height/1.3}").full-width.bg-black
    // кнопки управления образом(когда редактор фрагмента закрыт) (replay pause loop)
    div(v-if="mode === 'fullscreen' && pageId === 'node-editor' && $screenProps.isMobile").row.full-width.absolute-bottom.justify-center
      figures-controls( :player="player" :contentKalpa="content" :style=`{background: 'rgba(20,20,20,0.5)', borderRadius: '10px'}`)
    //- Desktop editor
    div(v-if="mode === 'fullscreen' && $screenProps.isDesktop && pageId !== 'node-editor'").row.full-width.absolute-bottom.justify-center.br
      transition(appear enter-active-class="animated fadeIn " leave-active-class="animated fadeOut")
        div(v-if="player && player.duration > 0" :style=`{ maxWidth: 600+'px', background: 'rgba(35,35,35,0.7)', borderRadius: '20px'}`).row.full-width
          page-node-editor(
            v-if="player && player.node && player.nodeMode === 'edit'"
            :contentKalpa="content"
            :topScreenHeight="topScreenHeight"
            :player="player"
            :style=`{
              minHeight: [null,'node','node-editor'].includes(pageId) ? '0px' : '500px',
              maxHeight: 500+'px',
              borderRadius: '10px',
              overflow: 'hidden',
            }`
            @node="nodeFocused")
            q-resize-observer(@resize="editorHeight = $event.height")
          player-pult(:player="player" :contentKalpa="content").z-top
  //- Mobile editor
  div(v-if="mode === 'fullscreen' && player && $screenProps.isMobile").full-width.justify-center
    .row.full-width
      q-resize-observer(@resize="editorHeight = $event.height")
      player-pult(v-if="pageId !== 'node-editor'" :player="player" :contentKalpa="content").z-top
      page-node-editor( v-else :contentKalpa="content" :topScreenHeight="topScreenHeight" :player="player" :style=`{height: $q.screen.height-50-contentHeight+'px',}` @node="nodeFocused").full-width
      q-btn( v-if="pageId !== 'node-editor' && player.nodeMode === 'edit'" flat color="green" no-caps :label="$t('Next')" @click="pageId = 'node-editor'").full-width
      q-btn( v-if="pageId === 'node-editor' && player.nodeMode === 'edit'" flat color="green" no-caps :label="$t('Edit fragment')" @click="pageId = null").full-width
      div(
        :style=`{position: 'relative'}`).row.full-width
        q-resize-observer(@resize="footerHeight = $event.height")
        //- Mobile button overlay
        div(
          v-if="player.nodeMode === 'edit' && $q.screen.lt.md"
          :style=`{position: 'absolute', zIndex: 100, bottom: '0px'}`).row.fit.bg-black.q-px-md
        //kalpa-menu-mobile(:styles=`{background: 'rgba(50,50,50,0)',}`)
</template>

<script>

// import playerDefault from 'src/components/content_player/player_video/player_default/index.vue'
import contentPlayer from 'src/components/content_player/index.vue'
import figuresControls from 'src/components/content_player/player_video/player_pult/figures_controls.vue'
import { assert } from 'src/system/common/utils'
import { RxCollectionEnum } from 'src/system/rxdb'
import playerPult from 'src/components/content_player/player_video/player_pult'
import pageNodeEditor from '../node_editor/video'

export default {
  name: 'pageContentVideo',
  components: { contentPlayer, figuresControls, playerPult, pageNodeEditor},
  props: ['content', 'mode', 'isActive'],
  emits: ['player'],
  data () {
    return {
      player: null,
      pageId: null,
      autocompleteName: '',
      contentHeight: 0,
      editorHeight: 0,
      footerHeight: 0
    }
  },
  computed: {
    topScreenHeight () {
      // this.$logT('this.$q.screen.height', this.$q.screen.height)
      // this.$logT('this.editorHeight', this.editorHeight)
      // this.$logT('this.footerHeight', this.footerHeight)
      assert(this.$q.screen.height - this.editorHeight - this.footerHeight > 0)
      // this.$logT('topScreenHeight', this.$q.screen.height - this.editorHeight - this.footerHeight)
      return this.$q.screen.height - this.editorHeight - this.footerHeight
    },
    contentHeightMin () {
      let tW = this.content.thumbWidth
      let tH = this.content.thumbHeight
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
          oidSphere: this.content.oid,
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
    nodeFocused (node) {
      this.$log('nodeFocused', node)
      this.pageId = null
      this.player.setState('node', node)
      this.player.setState('nodeMode', 'focus')
    },
    async playerReady (player) {
      this.$log('playerReady', this.draft)
      this.player = player
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
      this.$emit('player', player)
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
    this.$eventBus.$emit('notice-check', {notice: 'tutorial_content', force: false})
  },
  beforeUnmount () {
    this.$log('beforeDestroy')
    this.$store.commit('ui/stateSet', ['nodeOnContent', null])
    if (this.player) this.player.setState('nodePlaying', null)
    window.removeEventListener('keydown', this.onKeydown)
  }
}
</script>
