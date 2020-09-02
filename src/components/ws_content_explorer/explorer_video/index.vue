<template lang="pug">
q-layout(view="hHh Lpr lff")
  q-page-container
    //- header
    div(:style=`{opacity: 1}`).row.full-width.justify-center.b-30
      div(:style=`{position: 'relative', maxWidth: '800px'}`).row.full-width.q-pt-sm
        .row.full-width.items-start.content-start
          q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$emit('out', ['back'])")
          .col
            div(:style=`{borderRadius: '10px',}`
              ).row.full-width.items-center.content-center.justify-between.b-40
              q-icon(name="select_all" color="white" size="30px").q-mx-sm
              div(:style=`{overflowX: 'auto'}`).col
                span(:style=`{fontSize: '18px', whiteSpace: 'nowrap'}`).text-white.text-bold {{ contentWorkspace.name }}
              q-btn(round flat color="grey-8" icon="more_vert")
            div(:style=`{paddingLeft: '44px',}`).row.full-width.justify-start
              q-tabs(
                v-model="viewId"
                no-caps dense active-color="white" switch-indicator).text-grey-8
                q-tab(v-for="v in views" :key="v.id" :name="v.id" :label="v.name")
    //- player
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
          ws-content-player(
            :contentKalpa="contentKalpa"
            :contentWorkspace="contentWorkspace"
            @player="playerLoaded"
            @error="playerErrorHandle"
            :style=`{
              position: 'absolute', top: '0px',
              borderRadius: '10px', overflow: 'hidden',
              background: (player && player.isFullscreen) ? 'black' : 'none'
            }`).fit
            template(v-slot:actions)
              q-btn(
                v-if="true"
                @click="nodeCreateStart()"
                round push color="green" dense icon="add"
                :style=`{borderRadius: '50%'}`)
    //- view-fullscreen(
      v-if="(player && player.isFullscreen)"
      :player="player"
      :contentKalpa="contentKalpa"
      :contentWorkspace="contentWorkspace")
    //- view dynamic component
    component(
      v-if="player"
      :is="`view-${viewId}`"
      :ref="`view-${viewId}`"
      :player="player"
      :contentKalpa="contentKalpa"
      :contentWorkspace="contentWorkspace")
</template>

<script>
import wsContentPlayer from 'components/ws_content_player/index.vue'
import viewDetails from './view_details/index.vue'
import viewFragments from './view_fragments/index.vue'
import viewNodes from './view_nodes/index.vue'
import viewFullscreen from './view_fullscreen/index.vue'

export default {
  name: 'wsContentExplorer_video',
  components: {wsContentPlayer, viewDetails, viewFragments, viewNodes, viewFullscreen},
  props: ['contentKalpa', 'contentWorkspace'],
  data () {
    return {
      viewId: 'fragments',
      player: null,
      playerIsVisible: false,
    }
  },
  computed: {
    views () {
      return [
        {id: 'details', name: this.$t('wsContentExplorer_video_viewDetails_title', 'Детали')},
        {id: 'fragments', name: this.$t('wsContentExplorer_video_viewDrafts_title', 'Фрагменты')},
        {id: 'nodes', name: this.$t('wsContentExplorer_video_viewNodes_title', 'Ядра')},
      ]
    }
  },
  watch: {
    '$route.query.viewid': {
      immediate: true,
      handler (to, from) {
        this.$log('$route.query.viewId TO', to)
        if (to) {
          this.viewId = to
        }
      }
    }
  },
  methods: {
    async nodeCreateStart () {
      this.$log('nodeCreateStart')
      this.player.fullscreenToggle(false)
      this.viewId = 'fragments'
      this.$nextTick(() => {
        this.$refs['view-fragments'].nodeCreateStart()
      })
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
      let startat = this.$route.query.startat
      if (startat) {
        // alert('startat', startat)
        // this.$router.replace()
        this.player.setCurrentTime(startat)
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
      // handle nodeCreateStart()
      if (e.keyCode === 78) {
        this.nodeCreateStart()
      }
    }
  },
  created () {
    // let lastViewId = localStorage.getItem('k_wsContentExplorer_lastViewId')
    // if (lastViewId) this.viewId = lastViewId
  },
  mounted () {
    this.$log('mounted')
    window.addEventListener('keydown', this.keydownHandle)
    // window.addEventListener('focusin', (e) => {
    //   this.$log('focus!!!', e)
    // })
    // window.addEventListener('focusout', (e) => {
    //   this.$log('blur!!!', e)
    // })
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    window.removeEventListener('keydown', this.keydownHandle)
    // localStorage.setItem('k_wsContentExplorer_lastViewId', this.viewId)
  }
}
</script>
