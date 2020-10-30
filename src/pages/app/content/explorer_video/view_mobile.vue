<template lang="pug">
q-layout(
  view="hHh Lpr lff")
  q-header()
    .row.full-width.b-30
      //- player wrapper
      div(
        :style=`{
          ...playerStyles(),
        }`
        ).row.full-width.items-start.content-start.justify-center
        div(
          :style=`{
            maxWidth: (player && player.isFullscreen) ? '100%' : $store.state.ui.pageMaxWidth+'px',
            height: (player && player.isFullscreen) ? '100%' : 'auto',
          }`).row.full-width
          div(
            v-observe-visibility=`{
              callback: playerVisibilityCallback,
              intersection: {
                threshold: 0.8
              }
            }`
            :style=`{
              position: 'relative',
              height: (player && player.isFullscreen) ? '100%' : 'auto',
            }`).row.full-width.items-start.content-start
            content-player(
              :contentKalpa="contentKalpa"
              @player="playerLoaded"
              @error="playerErrorHandle"
              :style=`{
              }`).fit
              template(v-slot:actions)
                q-btn(
                  v-if="viewId !== 'node'"
                  @click="nodeCreate()"
                  round push color="green" dense icon="add"
                  :style=`{borderRadius: '50%'}`)
  q-page-container
    component(
      v-if="player"
      :is="`view-${viewId}`"
      :ref="`view-${viewId}`"
      :node="node"
      :player="player"
      :contentKalpa="contentKalpa"
      :contentBookmark="contentBookmark"
      :style=`{
        paddingTop: '8px',
      }`
      @node="viewId = 'node', node = $event"
      @close="viewId = 'nodes-mine', node = null")
      //- template(v-if="$scopedSlots.nodeAction" v-slot:nodeAction=`{node}`)
      //-   slot(name="nodeAction" :node="node")
      //- template(v-if="$scopedSlots.nodeActionMine" v-slot:nodeActionMine=`{node}`)
      //-   slot(name="nodeActionMine" :node="node")
      //- template(v-if="$scopedSlots.nodeActionAll" v-slot:nodeActionAll=`{node}`)
      //-   slot(name="nodeActionAll" :node="node")
      template(v-slot:bottom)
        div(
          :style=`{}`).row.full-width.justify-center
          div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width
            q-btn(round flat dense color="grey-8" icon="keyboard_arrow_left" @click="$router.back()" no-caps).q-ml-sm Back
            .col
              q-tabs(
                v-model="viewId"
                align="justify"
                no-caps active-color="green").full-width.text-grey-8
                q-tab(v-for="v in views" :key="v.id" :name="v.id" :label="v.name")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import contentPlayer from 'components/content_player/index.vue'

import viewDetails from './view_details/index.vue'
import viewNode from './view_node/index.vue'
import viewNodes from './view_nodes/index.vue'
import viewJoints from './view_joints/index.vue'
// TODO: impl
import viewFullscreen from './view_fullscreen/index.vue'

export default {
  name: 'contentExplorerVideo',
  components: {contentPlayer, viewDetails, viewNode, viewNodes, viewJoints, viewFullscreen},
  props: ['contentKalpa', 'query'],
  data () {
    return {
      viewId: 'nodes',
      player: null,
      playerIsVisible: false,
      contentBookmark: null,
      node: null,
    }
  },
  computed: {
    views () {
      return [
        {id: 'details', icon: 'info', name: 'About'},
        {id: 'nodes', icon: 'filter_tilt_shift', name: 'Nodes'},
        {id: 'joints', icon: 'link', name: 'Links'}
      ]
    },
    paddingLeft () {
      // return (this.$q.screen.width - this.$store.state.ui.pageMaxWidth) / 2
      return 260
    }
  },
  watch: {
    query: {
      immediate: true,
      async handler (to, from) {
        this.$log('query TO', to)
        // set viewId force, from feed or from workspace
        if (to && to.viewid) {
          this.viewId = to.viewid
        }
        // catch lastViewId
        else {
          // let viewId = localStorage.getItem('k_contentExplorer_viewid')
          // this.$log('viewId', viewId)
          // if (viewId) this.viewId = viewId
        }
        let [bookmark] = await this.$rxdb.find({selector: {rxCollectionEnum: RxCollectionEnum.WS_BOOKMARK, oid: this.contentKalpa.oid}})
        if (bookmark) this.contentBookmark = bookmark
      }
    }
  },
  methods: {
    async nodeCreate () {
      this.$log('nodeCreate')
      this.player.fullscreenToggle(false)
      // start/end
      let start = this.player.currentTime
      let end = start + 10 > this.player.duration ? this.player.duration : start + 10
      let nodeInput = {
        name: '',
        spheres: [],
        category: 'FUN',
        layout: 'VERTICAL',
        wsItemType: 'WS_NODE',
        thumbUrl: this.contentKalpa.thumbUrl,
        items: [
          {
            id: Date.now().toString(),
            thumbUrl: this.contentKalpa.thumbUrl,
            outputType: 'VIDEO',
            layers: [
              {id: Date.now().toString(), contentOid: this.contentKalpa.oid, figuresAbsolute: [{t: start, points: []}, {t: end, points: []}]},
            ],
            operation: { items: null, operations: null, type: 'CONCAT'},
            meta: {cover: false, loop: true}
          }
        ]
      }
      let node = await this.$rxdb.set(RxCollectionEnum.WS_NODE, nodeInput)
      this.$log('nodeCreate node', node)
      this.node = node
      this.viewId = 'node'
    },
    playerStyles () {
      if (this.player && this.player.isFullscreen) {
        return {
          position: 'fixed', zIndex: 9999, top: 0, left: 0, bottom: 0, right: 0, transform: 'translate3d(0,0,0)'
        }
      }
      else {
        return {}
      }
    },
    playerErrorHandle () {
      this.$log('playerErrorHandle')
      confirm('Player error! Try on desktop!')
    },
    playerVisibilityCallback (isVisible, entry) {
      // this.$log('playerVisibilityCallback', isVisible, entry)
      this.playerIsVisible = isVisible
      if (this.player) {
        if (isVisible) this.player.play()
        else this.player.pause()
      }
    },
    playerLoaded (player) {
      this.$log('playerLoaded', player)
      this.player = player
      let startat = this.query.startat
      this.$log('startat', startat)
      if (startat) {
        this.player.setCurrentTime(startat)
      }
    },
    handleFocusin (e) {
      if (e.target.type === 'text' || e.target.type === 'textarea') {
        // this.$log('handleFocusin', e)
        this.$store.commit('ui/stateSet', ['isTyping', true])
      }
    },
    handleFocusout (e) {
      if (e.target.type === 'text' || e.target.type === 'textarea') {
        // this.$log('handleFocusout', e)
        this.$store.commit('ui/stateSet', ['isTyping', false])
      }
    },
    keydownHandle (e) {
      if (this.$store.state.ui.isTyping) return
      this.$log('keydownHandle', e)
      // left/right keys for fast navigations
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        if (!this.player) return
        if (!this.playerIsVisible) return
        let t = this.player.currentTime
        if (e.key === 'ArrowLeft') t -= 5
        else if (e.key === 'ArrowRight') t += 5
        this.player.setCurrentTime(t)
      }
      // space for play/pause
      if (e.code === 'Space') {
        e.preventDefault()
        if (!this.player) return
        if (!this.playerIsVisible) return
        if (this.player.playing) this.player.pause()
        else this.player.play()
      }
      // handle Escape when in isFullscreen player mode
      if (e.key === 'Escape') {
        if (this.player && this.player.isFullscreen) this.player.fullscreenToggle()
      }
      // create Fragment with N or F
      if (e.keyCode === 78 || e.keyCode === 70) {
        this.nodeCreateStart()
      }
    }
  },
  mounted () {
    this.$log('mounted')
    window.addEventListener('keydown', this.keydownHandle)
    // prevent text,textarea events...
    window.addEventListener('focusin', this.handleFocusin)
    window.addEventListener('focusout', this.handleFocusout)
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    window.removeEventListener('keydown', this.keydownHandle)
    window.removeEventListener('focusin', this.handleFocusin)
    window.removeEventListener('focusout', this.handleFocusout)
    localStorage.setItem('k_contentExplorer_viewid', this.viewId)
    this.$store.commit('ui/stateSet', ['contentNodes', null])
  }
}
</script>
