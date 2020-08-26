<template lang="pug">
q-layout(view="hHh Lpr lff")
  q-header(reveal)
    .row.full-width.justify-center.b-30
      div(:style=`{position: 'relative', maxWidth: '800px'}`).row.full-width.q-pt-sm
        .row.full-width.items-start.content-start
          q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$router.back()")
          .col
            div(:style=`{borderRadius: '10px',}`
              ).row.full-width.items-center.content-center.justify-between.b-40
              q-icon(name="select_all" color="white" size="30px").q-mx-sm
              div(:style=`{overflowX: 'auto'}`).col
                span(:style=`{fontSize: '18px', whiteSpace: 'nowrap'}`).text-white.text-bold {{ contentWorkspaceName }}
              q-btn(round flat color="grey-8" icon="more_vert")
            div(:style=`{paddingLeft: '44px',}`).row.full-width.justify-start
              q-tabs(
                v-model="viewId"
                no-caps dense active-color="white" switch-indicator).text-grey-8
                q-tab(v-for="v in views" :key="v.id" :name="v.id" :label="v.name")
  q-page-container
    view-drafts(
      v-if="viewId === 'drafts'"
      :contentKalpa="contentKalpa"
      :contentWorkspace="contentWorkspace")
    view-details(
      v-if="viewId === 'details'"
      :contentKalpa="contentKalpa"
      :contentWorkspace="contentWorkspace")
    //- q-page(:style=`{paddingTop: '8px', paddingBottom: '50px',}`)
      .row.full-width.items-start.content-start.justify-center
        div(:style=`{maxWidth: '800px'}`).row.full-width.items-start.content-start.justify-center
          //- content wrapper
          div(
            :style=`{position: 'relative'}`
            v-observe-visibility=`{
              callback: contentVisibilityCallback,
              intersection: {
                threshold: 0.8
              }
            }`
            ).row.full-width.items-start.content-start.justify-center
            q-resize-observer(@resize="contentHeight = $event.height")
            //- content preview image
            img(
              :src="contentKalpa.thumbUrl" draggable="false"
              :style=`{borderRadius: '10px', overflow: 'hidden'}`).full-width
            ws-content-player(
              :contentKalpa="contentKalpa" :contentWorkspace="contentWorkspace"
              :bars="bars" :barsShow="true"
              @player="player = $event"
              @error="playerErrorHandle"
              :style=`{
                position: 'absolute', top: '0px',
                borderRadius: '10px', overflow: 'hidden',}`).fit
                template(v-slot:actions)
                  q-btn(
                    @click="$refs[`page-${pageId}`].nodeCreateStart()"
                    round push color="green" dense icon="add"
                    :style=`{borderRadius: '50%'}`)
          //- page wrapper
          div(v-if="player").row.full-width.items-start.content-start
            component(
              :is="`page-${viewId}`"
              :ref="`page-${viewId}`"
              :contentWorkspace="contentWorkspace" :contentKalpa="contentKalpa" :player="player"
              :pageHeight="pageHeight"
              @bars="bars = $event")
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
// views
import viewDrafts from './view_drafts/index.vue'
import viewDetails from './view_details/index.vue'

export default {
  name: 'wsContentExplorer_video',
  components: {
    viewDrafts, viewDetails, pageDetails, pageDrafts, pageNodes, pageRelated, wsContentPlayer: () => import('components/ws_content_player/index.vue')
  },
  props: ['contentKalpa', 'contentWorkspace'],
  data () {
    return {
      viewId: 'details',
      pageId: 'drafts',
      contentHeight: 0,
      player: null,
      playerVisible: false,
      playerComponent: {
        YOUTUBE: 'player-youtube',
        KALPA: 'player-kalpa',
      },
      bars: [],
      // nodeSelectedId: null,
    }
  },
  computed: {
    contentWorkspaceName () {
      return this.contentWorkspace.name.slice(0, 100)
    },
    pageHeight () {
      return this.$q.screen.height - 60 - 60 - this.contentHeight
    },
    views () {
      return [
        {id: 'details', name: this.$t('wsContentExplorer_video_viewDetails_title', 'Детали')},
        {id: 'drafts', name: this.$t('wsContentExplorer_video_viewDrafts_title', 'Заметки')},
        {id: 'nodes', name: this.$t('wsContentExplorer_video_viewNodes_title', 'Ядра')},
      ]
    }
  },
  watch: {
    '$q.appVisible': {
      handler (to, from) {
        this.$log('$q.appVisible TO', to)
        if (to) {
          // if (this.playerVisible) this.player.play()
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
    keydownHandle (e) {
      // this.$log('keydownHandle', e)
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
