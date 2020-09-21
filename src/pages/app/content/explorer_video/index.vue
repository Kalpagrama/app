<template lang="pug">
div(:style=`{height: $q.screen.height+'px'}`).column.full-width
  .row.full-width.justify-center.b-30
    div(:style=`{position: 'relative', maxWidth: '800px'}`).row.full-width.q-pt-sm.q-pb-sm
      slot(name="header")
      div(v-if="!$slots.header" :style=`{height: '60px'}`).row.full-width.items-between.content-between.q-px-sm
        q-btn(
          @click="$emit('out', ['back'])"
          round flat color="white" icon="keyboard_arrow_left")
        .col.full-height.q-mx-xs
          div(
            :style=`{borderRadius: '10px', overflow: 'hidden'}`
            ).row.fit.items-center.content-center.b-40.q-pa-sm
            q-icon(name="select_all" color="white" size="30px").q-mx-xs
            div(:style=`{overflowX: 'auto'}`).col.q-mr-md
              //- span(:style=`{fontSize: '18px', whiteSpace: 'nowrap'}`).text-white.text-bold {{ contentKalpa.name }}
              span(:style=`{fontSize: '18px', whiteSpace: 'nowrap'}`).text-white.text-bold Контент
            //- q-btn(
              @click="viewId = 'details'"
              round flat color="white" icon="info")
            kalpa-follow(
              v-if="contentKalpa"
              :oid="contentKalpa.oid")
        q-btn(
          @click="contentBookmarkCreate()"
          round flat color="white" :icon="contentBookmark ? 'bookmark' : 'bookmark_outline'")
      div(:style=`{paddingLeft: '66px', paddingRight: '60px',}`).row.full-width.justify-start
        q-tabs(
          v-model="viewId"
          no-caps dense active-color="white" switch-indicator).full-width.text-grey-8
          q-tab(v-for="v in views" :key="v.id" :name="v.id" :label="v.name")
  div(
    :style=`{
      ...playerStyles(),
    }`
    ).row.full-width.items-start.content-start.justify-center
    div(
      :style=`{
        maxWidth: (player && player.isFullscreen) ? '100%' : '800px',
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
        img(
          :src="contentKalpa.thumbUrl"
          draggable="false"
          :style=`{
            borderRadius: '10px', overflow: 'hidden',
            height: (player && player.isFullscreen) ? '100%' : 'auto',
            opacity: 0.1,
            objectFit: 'contain',
          }`
          ).full-width
        content-player(
          :contentKalpa="contentKalpa"
          @player="playerLoaded"
          @error="playerErrorHandle"
          :style=`{
            position: 'absolute', top: '0px',
            borderRadius: '10px', overflow: 'hidden',
            background: (player && player.isFullscreen) ? 'black' : 'none'
          }`).fit
          template(v-slot:actions)
            q-btn(
              v-if="viewId !== 'node'"
              @click="nodeCreate()"
              round push color="green" dense icon="add"
              :style=`{borderRadius: '50%'}`)
  div(:style=`{position: 'relative'}`).col.full-width.scroll
    component(
      v-if="player"
      :is="`view-${viewId}`"
      :ref="`view-${viewId}`"
      :node="node"
      :player="player"
      :contentKalpa="contentKalpa"
      :contentBookmark="contentBookmark"
      @node="viewId = 'node', node = $event"
      @close="viewId = 'nodes-mine', node = null")
      template(v-slot:nodeAction=`{node}`)
        slot(name="nodeAction" :node="node")
      template(v-slot:nodeActionMine=`{node}`)
        slot(name="nodeActionMine" :node="node")
      template(v-slot:nodeActionAll=`{node}`)
        slot(name="nodeActionAll" :node="node")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import contentPlayer from 'components/content_player/index.vue'

import viewDetails from './view_details/index.vue'
import viewNode from './view_node/index.vue'
import viewNodesMine from './view_nodes_mine/index.vue'
import viewNodesAll from './view_nodes_all/index.vue'
import viewFullscreen from './view_fullscreen/index.vue'

export default {
  name: 'contentExplorerVideo',
  components: {contentPlayer, viewDetails, viewNode, viewNodesAll, viewNodesMine, viewFullscreen},
  props: ['contentKalpa', 'query'],
  data () {
    return {
      viewId: 'nodes-mine',
      player: null,
      playerIsVisible: false,
      contentBookmark: null,
      node: null,
    }
  },
  computed: {
    views () {
      return [
        {id: 'details', name: this.$t('wsContentExplorer_video_viewDetails_title', 'Детали')},
        {id: 'nodes-mine', name: this.$t('wsContentExplorer_video_viewNodesMine_title', 'Мои ядра')},
        {id: 'nodes-all', name: this.$t('wsContentExplorer_video_viewNodesAll_title', 'Все ядра')},
      ]
    }
  },
  watch: {
    query: {
      immediate: true,
      async handler (to, from) {
        this.$log('query TO', to)
        // set viewId force, from feed or from workspace
        if (to.viewid) {
          this.viewId = to.viewid
        }
        // catch lastViewId
        else {
          let viewId = localStorage.getItem('k_contentExplorer_viewid')
          this.$log('viewId', viewId)
          if (viewId) this.viewId = viewId
        }
        // find bookmark
        let {items: [contentBookmark]} = await this.$rxdb.find({selector: {rxCollectionEnum: RxCollectionEnum.WS_BOOKMARK, oid: this.contentKalpa.oid}})
        this.$log('contentBookmark', contentBookmark)
        if (contentBookmark) this.contentBookmark = contentBookmark
      }
    }
  },
  methods: {
    async contentBookmarkCreate () {
      this.$log('contentBookmarkCreate')
      let {items: [contentBookmark]} = await this.$rxdb.find({selector: {rxCollectionEnum: RxCollectionEnum.WS_BOOKMARK, oid: this.contentKalpa.oid}})
      if (!contentBookmark) {
        let contentBookmarkInput = {
          oid: this.contentKalpa.oid,
          name: this.contentKalpa.name,
          thumbUrl: this.contentKalpa.thumbUrl,
          type: 'CONTENT',
          contentType: this.contentKalpa.type,
          wsItemType: 'WS_BOOKMARK',
          spheres: []
        }
        contentBookmark = await this.$rxdb.set(RxCollectionEnum.WS_BOOKMARK, contentBookmarkInput)
      }
      this.$log('contentBookmark', contentBookmark)
      this.contentBookmark = contentBookmark
    },
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
        layout: 'PIP',
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
