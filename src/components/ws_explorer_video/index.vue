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
            //- content preview
            img(
              :src="contentKalpa.thumbUrl" draggable="false"
              :style=`{borderRadius: '10px', overflow: 'hidden'}`).full-width
            //- content player, depends on contentKalpa.contentSouce, $emits itself...
            component(
              :is="playerComponent[contentKalpa.contentSource]"
              :url="contentKalpa.url"
              @player="player = $event"
              @error="playerErrorHandle"
              :style=`{
                position: 'absolute', top: '0px',
                borderRadius: '10px', overflow: 'hidden',}`).fit
            //- bar
            div(
              v-if="player"
              :style=`{position: 'absolute', zIndex: 1000, bottom: '0px',}`).row.full-width.justify-center
              content-bar(
                :player="player"
                :bars="bars" :barsShow="!nodeSelectedId"
                :style=`{
                  maxWidth: '600px',
                }`)
                template(v-slot:header)
                  .row.full-width.justify-between.q-py-xs
                    q-btn(
                      @click="player.playing ? player.pause() : player.play()"
                      round flat dense
                      :color="player.playing ? 'red' : 'white'"
                      :icon="player.playing ? 'pause' : 'play_arrow'"
                      :style=`{borderRadius: '50%', background: 'rgba(0,0,0,0.5)'}`)
                    div(:style=`{background: 'rgba(0,0,0,0.5)', borderRadius: '10px', overflow: 'hidden',}`).row.full-height.items-center.content-center
                      q-btn(round flat dense color="white" icon="volume_off")
                      q-btn(
                        flat dense color="white"
                        :style=`{}`
                        )
                        small.text-white {{$time(player.currentTime)}} / {{$time(player.duration)}}
                      q-btn(round flat dense color="white" icon="fullscreen")
                    q-btn(
                      @click="nodeAdd()"
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
// players: youtube,kalpa(html5),vimeo,vk,fb
// import playerYoutube from './player_youtube/index.vue'
import playerKalpa from './player_kalpa/index.vue'
// pages
import pageDetails from './page_details/index.vue'
import pageDrafts from './page_drafts/index.vue'
import pageNodes from './page_nodes/index.vue'
import pageRelated from './page_related/index.vue'
// content
import contentBar from './content_bar/index.vue'

export default {
  name: 'wsVideoExplorer',
  components: {
    pageDetails, pageDrafts, pageNodes, pageRelated, contentBar, playerKalpa, playerYoutube: () => import('./player_youtube/index.vue')
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
      await this.$wait(200)
      this.nodeSelectedId = null
      this.nodeEditingId = null
      this.$nextTick(() => {
        this.nodeSelectedId = node.id
        this.nodeEditingId = node.id
      })
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
        contentOid: this.contentKalpa.oid,
        color: this.contentKalpa.thumbUrl,
        items: [
          {
            contentOid: this.contentKalpa.oid,
            layers: [
              {contentOid: this.contentKalpa.oid, figuresAbsolute: [{t: start, points: []}, {t: end, points: []}], spheres: []},
            ],
            operation: { items: null, operations: null, type: 'CONCAT'},
            spheres: []
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
