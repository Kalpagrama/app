<template lang="pug">
q-layout(
  view="hHh Lpr lff")
  q-header().b-30
    div(:style=`{paddingLeft: 70+'px'}`).row.full-width.q-pt-sm.q-px-sm
      div(:style=`{borderRadius: '10px'}`).row.full-width.b-40
        .col
          div(
            :style=`{height: '60px'}`).row.full-width.items-between.content-between
            div(
              :style=`{borderRadius: '10px', overflow: 'hidden'}`
              ).row.fit.items-center.content-center.q-pa-sm.b-40
              q-btn(
                @click="$router.back()"
                round flat color="white" icon="keyboard_arrow_left")
              q-icon(name="select_all" color="white" size="20px").q-mr-xs
              div(:style=`{overflowX: 'auto'}`).col
                span(:style=`{fontSize: '1rem', whiteSpace: 'nowrap'}`).text-white.text-bold {{ contentKalpa.name }}
        //- header right side
        div(
          :style=`{width: '500px',}`).row.items-end.content-end.q-pl-sm
          div(:style=`{height: '60px', borderRadius: '10px', overflow: 'hidden'}`).row.full-width.q-pl-sm
            q-tabs(
              :value="viewId" @input="$event => $router.replace({query: {...$route.query, viewid: $event}})"
              align="justify"
              no-caps dense active-color="green").full-width.text-grey-8
              q-tab(
                v-for="v in views" :key="v.id"
                v-if="v.id !== 'details'"
                :name="v.id" :label="v.name").text-bold
  q-page-container
    q-page(
      :style=`{
        paddingLeft: 70+'px',
        paddingTop: '8px',
      }`).row.full-width
      .row.full-width.justify-start.items-start.content-start
        div(:style=`{position: 'relative'}`).col.q-pr-sm
          div(:style=`{position: 'relative',}`).row.full-width.items-start.content-start
            content-player(
              :contentKalpa="contentKalpa"
              @player="playerLoaded"
              @error="playerErrorHandle"
              :style=`{
              }`).full-width
              template(v-slot:bar)
                q-btn(
                  v-if="!node && viewId !== 'node'"
                  @click="nodeCreateStart()"
                  round color="green" icon="add"
                  :style=`{
                    position: 'absolute', zIndex: 1000, bottom: '4px', borderRadius: '50%',
                    left: 'calc(50% - 20px)'
                  }`)
          page-details(
            v-if="!node"
            :node="node"
            :player="player"
            :contentKalpa="contentKalpa"
            :contentBookmark="contentBookmark")
          page-node(
            v-if="node"
            :node="node"
            :player="player"
            :contentKalpa="contentKalpa"
            :contentBookmark="contentBookmark"
            @linked="linked = $event"
            @close="node = null")
        //- body right side
        div(
          :style=`{width: '500px'}`).row.items-start.content-start
          q-layout(
            view="hHh Lpr lff"
            container
            :style=`{
              width: '500px',
              height: $q.screen.height-80+'px',
            }`)
            q-page-container
              component(
                v-if="player"
                :is="`page-${viewId}`"
                :player="player"
                :contentKalpa="contentKalpa"
                :contentBookmark="contentBookmark"
                :nodeEditingId="node ? node.id : null"
                :style=`{
                  paddingTop: '40px',
                }`
                @bookmark="contentBookmark = $event"
                @nodeCreate="nodeCreate"
                @nodeEdit="nodeEdit"
                @figures="figures = $event"
                @close="node = null")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import contentPlayer from 'components/content_player/index.vue'

import pageDetails from './page_details/index.vue'
import pageNode from './page_node/index.vue'
import pageNodes from './page_nodes/index.vue'
import pageJoints from './page_joints/index.vue'

// import viewNodesBar from './view_nodes_bar/index.vue'

export default {
  name: 'contentExplorerVideo',
  components: {contentPlayer, pageDetails, pageNode, pageNodes, pageJoints},
  props: ['contentKalpa', 'query'],
  data () {
    return {
      player: null,
      playerIsVisible: false,
      contentBookmark: null,
      node: null,
      screenshotUrl: null,
      figures: [],
    }
  },
  computed: {
    views () {
      return [
        {id: 'details', icon: 'info', name: 'Детали'},
        {id: 'nodes', icon: 'filter_tilt_shift', name: 'Ядра'},
        {id: 'joints', icon: 'link', name: 'Связи'},
        {id: 'similar', icon: '', name: 'Похожее'}
      ]
    },
    paddingLeft () {
      return this.$q.screen.gt.md ? 250 : 76
    },
    viewId () {
      if (this.query && this.query.viewid) return this.query.viewid
      else return null
    },
    mode () {
      if (this.query && this.query.mode) return this.query.mode
      else return null
    }
  },
  watch: {
    query: {
      immediate: true,
      async handler (to, from) {
        this.$log('query TO', to)
        if (to) {
          if (to.viewid) {
          }
          else {
            this.$router.replace({query: {viewid: 'nodes', ...to}})
          }
        }
        // get bookmark
        let [bookmark] = await this.$rxdb.find({selector: {rxCollectionEnum: RxCollectionEnum.WS_BOOKMARK, oid: this.contentKalpa.oid}})
        if (bookmark) this.contentBookmark = bookmark
      }
    }
  },
  methods: {
    async nodeCreateStart () {
      this.$log('nodeCreateStart')
      // create something link or node... or always node...
      let node = await this.nodeCreate()
      this.nodeEdit(node)
    },
    async nodeCreate () {
      this.$log('nodeCreate')
      let nodeInput = {
        name: '',
        spheres: [],
        category: 'FUN',
        layout: 'VERTICAL',
        thumbUrl: this.contentKalpa.thumbUrl,
        items: [
          {
            id: Date.now().toString(),
            thumbUrl: this.contentKalpa.thumbUrl,
            outputType: 'IMAGE',
            layers: [
              {id: Date.now().toString(), contentOid: this.contentKalpa.oid, figuresAbsolute: [{t: null, points: []}, {t: null, points: []}]},
            ],
            operation: { items: null, operations: null, type: 'CONCAT'},
            meta: {cover: false, loop: true}
          }
        ]
      }
      let node = await this.$rxdb.set(RxCollectionEnum.WS_NODE, nodeInput)
      this.$log('nodeCreate node', node)
      return node
    },
    async nodeEdit (node) {
      this.$log('nodeEdit', node)
      this.node = null
      await this.$wait(300)
      this.node = node
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
    keydownHandle (e) {
      if (this.$store.state.ui.userTyping) return
      this.$log('keydownHandle', e)
      // left/right keys for fast navigations
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        if (!this.player) return
        // if (!this.playerIsVisible) return
        let t = this.player.currentTime
        if (e.key === 'ArrowLeft') t -= 5
        else if (e.key === 'ArrowRight') t += 5
        this.player.setCurrentTime(t)
      }
      // space for play/pause
      if (e.code === 'Space') {
        e.preventDefault()
        if (!this.player) return
        // if (!this.playerIsVisible) return
        if (this.player.playing) this.player.pause()
        else this.player.play()
      }
      // handle Escape when in isFullscreen player mode
      if (e.key === 'Escape') {
        if (this.player && this.player.isFullscreen) this.player.fullscreenToggle()
      }
      // create Fragment with N or F
      if (e.keyCode === 78 || e.keyCode === 70) {
        this.createStart()
      }
    }
  },
  mounted () {
    this.$log('mounted')
    window.addEventListener('keydown', this.keydownHandle)
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    window.removeEventListener('keydown', this.keydownHandle)
    this.$store.commit('ui/stateSet', ['contentFigures', null])
  }
}
</script>
