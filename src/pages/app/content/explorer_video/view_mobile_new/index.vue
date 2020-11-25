<template lang="pug">
q-layout(
  view="hHh Lpr lff")
  q-header()
    .row.full-width.b-30
      q-resize-observer(@resize="onResize")
      content-player(
        :contentKalpa="contentKalpa"
        @player="playerLoaded"
        @error="playerErrorHandle"
        :style=`{
          borderRadius: '10px',
          //- overflow: 'hidden',
        }`).fit
        template(v-slot:bar)
          div(
            v-if="player && figures.length > 0"
            :style=`{
              position: 'absolute', zIndex: 2050, pointerEvents: 'none',
              //- borderRadius: '10px', overflow: 'hidden',
            }`
            ).row.fit
            template(v-for="(f,fi) in figures")
              div(
                v-if="f.length === 1"
                :key="fi"
                :style=`{
                  position: 'absolute', zIndex: 2050, top: '0px',
                  left: f[0].t/player.duration*100+'%',
                  width: '2px',
                  background: 'rgba(255,255,255, 0.5)',
                }`
                ).row.full-height
              div(
                v-if="f.length === 2"
                :key="fi"
                :style=`{
                  position: 'absolute', zIndex: 2050, top: '-2px',
                  left: f[0].t/player.duration*100+'%',
                  width: (f[1].t-f[0].t)/player.duration*100+'%',
                  height: 'calc(100% + 4px)',
                  border: '2px solid rgb(76,175,80)',
                  borderRadius: '4px',
                  background: 'rgba(255,255,255,0.2)',
                  pointerEvents: 'none',
                }`
                ).row
        template(v-slot:bar-current-time=`{panning}`)
          transition(enter-active-class="animated fadeIn" leave-active-class="none")
            q-btn(
              v-if="player && !panning && pageId !== 'node'"
              @click="nodeCreateStart()"
              round color="green" icon="add" dense
              :style=`{
                position: 'absolute', zIndex: 1000, top: '-44px', borderRadius: '50%',
                left: 'calc('+(player.currentTime/player.duration)*100+'% - 17px)',
              }`)
      //- .row.full-width.q-pa-md.bg-red
        span.text-white.text-bold {{ contentKalpa.name }}
  //- q-footer()
    .row.full-width.bg-black.q-pa-md
      span.text-white menu
  q-page-container
    q-page-sticky(
      v-if="pageId !== 'node'"
      expand position="bottom"
      :style=`{zIndex: 1000, borderRadius: '10px 10px 0 0',}`
      ).full-width.b-30
      //- div(:style=`{height: '50px',}`).row.full-width.bg-blue.q-pa-md
      div(
        :style=`{height: '50px',}`).row.full-width.justify-center
        div(:style=`{maxWidth: 700+'px'}`).row.full-width
          q-btn(round flat dense color="grey-8" icon="keyboard_arrow_left" @click="$router.back()" no-caps).q-mx-sm Назад
          .col
            q-tabs(
              v-model="pageId"
              align="justify"
              no-caps active-color="green").full-width.text-grey-8
              q-tab(v-for="p in pages" :key="p.id" :name="p.id" :label="p.name")
    component(
      v-if="player && contentKalpa"
      :is="`page-${pageId}`"
      :contentKalpa="contentKalpa" :node="node"
      :player="player"
      :headerHeight="headerHeight"
      @close="pageId = 'nodes'")
    //- component(
      v-if="player"
      :is="`view-${viewId}`"
      :ref="`view-${viewId}`"
      :node="node"
      :player="player"
      :contentKalpa="contentKalpa"
      :contentBookmark="contentBookmark"
      :style=`{
        paddingTop: '8px',
        paddingBottom: '100px',
      }`
      @bookmark="contentBookmark = $event"
      @nodeCreate="nodeCreate"
      @nodeEdit="nodeEdit"
      @close="viewId = 'nodes', node = null"
      @figures="figures = $event")
      template(v-slot:bottom)
        div(
          :style=`{}`).row.full-width.justify-center
          div(:style=`{maxWidth: 700+'px'}`).row.full-width
            q-btn(round flat dense color="grey-8" icon="keyboard_arrow_left" @click="$router.back()" no-caps).q-mx-md Назад
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

// import viewDetails from './view_details/index.vue'
// import viewNode from './view_node/index.vue'
// import viewNodes from './view_nodes/index.vue'
// import viewJoints from './view_joints/index.vue'
// TODO: impl
// import viewFullscreen from './view_fullscreen/index.vue'
import pageNodes from './page_nodes/index.vue'
import pageDetails from './page_details/index'
import pageNode from './page_node/index.vue'
import pageJoints from './page_joints/index.vue'

export default {
  name: 'contentExplorerVideo',
  // components: {contentPlayer, viewDetails, viewNode, viewNodes, viewJoints, viewFullscreen},
  components: {contentPlayer, pageNodes, pageDetails, pageNode, pageJoints},
  props: ['contentKalpa', 'query'],
  data () {
    return {
      pageId: 'nodes',
      player: null,
      playerIsVisible: false,
      contentBookmark: null,
      node: null,
      figures: [],
      headerHeight: 0,
    }
  },
  computed: {
    pages () {
      return [
        {id: 'details', icon: 'info', name: 'Детали'},
        {id: 'nodes', icon: 'filter_tilt_shift', name: 'Ядра'},
        {id: 'joints', icon: 'link', name: 'Связи'},
        {id: 'similar', icon: 'menu', name: 'Similar'}
      ]
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
        this.$log('boookmarkkkkk', bookmark)
        if (bookmark) this.contentBookmark = bookmark
      }
    }
  },
  methods: {
    onResize (e) {
      this.$log('onResize', e)
      this.headerHeight = e.height
    },
    async nodeCreateStart () {
      this.$log('nodeCreateStart')
      // create something link or node... or always node...
      let node = await this.nodeCreate()
      this.nodeEdit(node)
    },
    async nodeCreate () {
      this.$log('nodeCreate')
      // this.player.fullscreenToggle(false)
      // start/end
      let start = this.player.currentTime
      let end = start + 30 > this.player.duration ? this.player.duration : start + 30
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
            outputType: 'VIDEO',
            layers: [
              {id: Date.now().toString(), contentOid: this.contentKalpa.oid, figuresAbsolute: [{t: start, points: []}, {t: end, points: []}]},
            ],
            operation: { items: null, operations: null, type: 'CONCAT'},
          }
        ]
      }
      // let node = await this.$rxdb.set(RxCollectionEnum.WS_NODE, nodeInput)
      let node = nodeInput
      this.$log('nodeCreate node', node)
      return node
    },
    async nodeEdit (node) {
      this.$log('nodeEdit', node)
      if (this.node === null) {
        this.node = node
      }
      else {
        this.node = null
        await this.$wait(300)
        this.node = node
      }
      this.pageId = 'node'
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
      if (this.player && this.player.play) {
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
  }
}
</script>
