<template lang="pug">
q-layout(view="hHh Lpr lff")
  q-header(reveal)
    .row.full-width.justify-center.b-30
      div(
        :style=`{maxWidth: '800px', height: '50px', overflow: 'hidden'}`
        ).row.full-width.items-center.content-center.q-px-md.b-30
        span(:style=`{fontSize: '18px', whiteSpace: 'nowrap'}`).text-white.text-bold {{ contentWorkspaceName }}
  q-page-container
    q-page(:style=`{paddingBottom: '200px',}`)
      .row.full-width.items-start.content-start.justify-center
        div(:style=`{maxWidth: '800px'}`).row.full-width.items-start.content-start
          //- content wrapper
          div(
            :style=`{position: 'relative'}`
            v-observe-visibility=`{
              callback: contentVisibilityCallback,
              intersection: {
                threshold: 0.8
              }
            }`
            ).row.full-width.items-start.content-start
            q-resize-observer(@resize="contentHeight = $event.height")
            //- content preview image
            img(
              :src="contentKalpa.thumbUrl" draggable="false"
              :style=`{borderRadius: '10px', overflow: 'hidden'}`).full-width
            ws-content-player(
              :contentKalpa="contentKalpa" :contentWorkspace="contentWorkspace"
              :bars="bars" :barsShow="!nodeSelectedId"
              @player="player = $event"
              @error="playerErrorHandle"
              :style=`{
                position: 'absolute', top: '0px',
                borderRadius: '10px', overflow: 'hidden',}`).fit
                template(v-slot:actions)
                  q-btn(
                    @click="nodeAddStart()"
                    round push color="green" dense icon="add"
                    :style=`{borderRadius: '50%'}`)
          //- page wrapper
          div(v-if="player").row.full-width.items-start.content-start
            component(
              :is="`page-${pageId}`"
              :contentWorkspace="contentWorkspace" :contentKalpa="contentKalpa" :player="player"
              :pageHeight="pageHeight"
              :nodeSelectedId="nodeSelectedId"
              @nodeSelected="nodeSelectedId = $event"
              @nodeUnselected="nodeSelectedId = null"
              @bars="bars = $event")
      //- footer: page control
      q-page-sticky(expand position="bottom" :style=`{zIndex: 1000}`)
        .row.full-width.justify-center.b-30
          div(:style=`{maxWidth: '800px', height: '50px', zIndex:1000}`
            ).row.full-width.items-center.content-center.b-30
            q-btn(
              @click="$emit('back')"
              round flat color="white" icon="keyboard_arrow_left").q-ml-xs
            .col.full-height
              q-tabs(v-model="pageId" no-caps active-color="white").fit.text-grey-6
                q-tab(name="details" label="Details")
                q-tab(name="related" label="Related")
                q-tab(name="drafts" label="Drafts")
                q-tab(name="nodes" label="Nodes")
</template>

<script>
// api
import { RxCollectionEnum } from 'src/system/rxdb'
import { NodeApi } from 'src/api/node'
// pages
import pageDetails from './page_details/index.vue'
import pageDrafts from './page_drafts/index.vue'
import pageNodes from './page_nodes/index.vue'
import pageRelated from './page_related/index.vue'

export default {
  name: 'wsVideoExplorer',
  components: {
    pageDetails, pageDrafts, pageNodes, pageRelated, wsContentPlayer: () => import('components/ws_content_player/index.vue')
  },
  props: ['contentKalpa', 'contentWorkspace'],
  data () {
    return {
      pageId: 'drafts',
      contentHeight: 0,
      player: null,
      playerVisible: false,
      playerComponent: {
        YOUTUBE: 'player-youtube',
        KALPA: 'player-kalpa',
      },
      bars: [],
      nodeSelectedId: null,
    }
  },
  computed: {
    contentWorkspaceName () {
      return this.contentWorkspace.name.slice(0, 100)
    },
    pageHeight () {
      return this.$q.screen.height - 50 - 50 - this.contentHeight
    },
  },
  watch: {
    '$q.appVisible': {
      handler (to, from) {
        this.$log('$q.appVisible TO', to)
        if (to) {
          if (this.playerVisible) this.player.play()
        }
        else {
          this.player.pause()
        }
      }
    }
  },
  methods: {
    contentVisibilityCallback (isVisible, entry) {
      // this.$log('contentVisibilityCallback', isVisible, entry)
      this.playerVisible = isVisible
      if (this.player) {
        if (isVisible) this.player.play()
        else this.player.pause()
      }
    },
    playerErrorHandle () {
      this.$log('playerErrorHandle')
      confirm('Player error! Try on desktop!')
    },
    async nodeAddStart () {
      this.$log('nodeAddStart')
      let node = await this.nodeAdd()
      this.nodeSelectedId = node.id
    },
    async nodeAdd () {
      this.$log('nodeAdd')
      // start/end
      let start = this.player.currentTime
      let end = start + 10 > this.player.duration ? this.player.duration : start + 10
      let nodeInput = {
        name: '',
        spheres: [],
        category: 'FUN',
        layout: 'PIP',
        stage: 'draft',
        wsItemType: 'WS_NODE',
        items: [
          {
            id: Date.now().toString(),
            thumbUrl: this.contentKalpa.thumbUrl,
            outputType: 'VIDEO',
            layers: [
              {contentOid: this.contentKalpa.oid, figuresAbsolute: [{t: start, points: []}, {t: end, points: []}]},
            ],
            operation: { items: null, operations: null, type: 'CONCAT'},
          }
        ]
      }
      let node = await this.$rxdb.set(RxCollectionEnum.WS_NODE, nodeInput)
      this.$log('node', node)
      return node
    },
    keydownHandle (e) {
      this.$log('keydownHandle', e)
      if (this.$store.state.ui.isTyping) return
      // left/right keys for fast navigations
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        if (!this.player) return
        if (!this.playerVisible) return
        let t = this.player.currentTime
        if (e.key === 'ArrowLeft') t -= 5
        else if (e.key === 'ArrowRight') t += 5
        this.player.setCurrentTime(t)
      }
      // space for play/pause
      if (e.code === 'Space') {
        e.preventDefault()
        if (!this.player) return
        if (!this.playerVisible) return
        if (this.player.playing) this.player.pause()
        else this.player.play()
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
