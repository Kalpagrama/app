<template lang="pug">
.row.full-width
  div(
    :style=`{ height: player && player.isFullscreen ? $q.screen.height+'px':'auto'}`
    :class=`{
         'content-center': !player || player.nodeMode !== 'edit',
         'content-start': player && player.nodeMode === 'edit',
         'items-center': !player || player.nodeMode !== 'edit',
         'items-start': player && player.nodeMode === 'edit',
         'bg-black': !player || player.nodeMode !== 'edit',
     }`
    ).row.full-width
    node-focused( v-if="player && player.node && player.nodeMode === 'focus'" :player="player" :contentKalpa="content")
    content-player(
      :contentKalpa="content"
      :options="{maxHeight: player && player.isFullscreen ? $q.screen.height-editorHeight:$q.screen.height/1.3}"
      @player="playerReady"
      ).row.full-width
      q-resize-observer(@resize="contentHeight = $event.height")
    .row.full-width.justify-center
      //div(v-if="player && player.duration > 0" :style=`{ maxWidth: 600+'px', background: 'rgba(35,35,35,0.7)', borderRadius: '20px'}`).row.full-width
      q-resize-observer(@resize="editorHeight = $event.height")
      page-node-editor(v-if="player && player.duration > 0 && player.node && player.nodeMode === 'edit'" :contentKalpa="content" :player="player").row.full-width.br-10.b-35
</template>

<script>

// import playerDefault from 'src/components/content_player/player_video/player_default/index.vue'
import contentPlayer from 'src/components/content_player/index.vue'
import figuresControls from 'src/components/content_player/player_video/player_pult/figures_controls.vue'
import { assert } from 'src/system/common/utils'
import { RxCollectionEnum } from 'src/system/rxdb'
import pageNodeEditor from 'src/components/kalpa_item/item_extended/content_extended/node_editor/video'
import nodeFocused from 'src/components/content_player/player_video/player_pult/node_focused.vue'

export default {
  name: 'pageContentVideo',
  components: { contentPlayer, figuresControls, pageNodeEditor, nodeFocused},
  props: ['content', 'isActive'],
  emits: ['player'],
  data () {
    return {
      player: null,
      autocompleteName: '',
      contentHeight: 0,
      editorHeight: 0,
      footerHeight: 0
    }
  },
  computed: {
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
  methods: {
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
