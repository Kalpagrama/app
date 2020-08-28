<template lang="pug">
q-layout(view="hHh Lpr lff")
  //- q-header(reveal)
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
    .row.full-width.items-start.content-start.justify-center.q-pt-sm
      div(:style=`{maxWidth: '800px'}`).row.full-width
        div(
          v-observe-visibility=`{
            callback: playerVisibilityCallback,
            intersection: {
              threshold: 0.8
            }
          }`
          :style=`{position: 'relative'}`).row.full-width.items-start.content-start
          img(
            :src="contentKalpa.thumbUrl"
            draggable="false"
            :style=`{
              borderRadius: '10px', overflow: 'hidden',
            }`
            ).full-width
          ws-content-player(
            :contentKalpa="contentKalpa"
            :contentWorkspace="contentWorkspace"
            @player="player = $event"
            @error="playerErrorHandle"
            :style=`{
              position: 'absolute', top: '0px',
              borderRadius: '10px', overflow: 'hidden',
            }`).fit
            template(v-slot:actions)
              q-btn(
                v-if="viewId === 'fragments'"
                @click="$refs[`view-${viewId}`].nodeCreateStart()"
                round push color="green" dense icon="add"
                :style=`{borderRadius: '50%'}`)
    //- view dynamic component
    component(
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

export default {
  name: 'wsContentExplorer_video',
  components: {wsContentPlayer, viewDetails, viewFragments, viewNodes},
  props: ['contentKalpa', 'contentWorkspace'],
  data () {
    return {
      viewId: 'fragments',
      player: null,
      playerIsVisible: false
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
  methods: {
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
    keydownHandle (e) {
      if (this.$store.state.ui.isTyping) return
      // this.$log('keydownHandle', e)
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
    }
  },
  created () {
    let lastViewId = localStorage.getItem('wsContentExplorer_lastViewId')
    if (lastViewId) this.viewId = lastViewId
  },
  mounted () {
    this.$log('mounted')
    window.addEventListener('keydown', this.keydownHandle)
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    window.removeEventListener('keydown', this.keydownHandle)
    localStorage.setItem('wsContentExplorer_lastViewId', this.viewId)
  }
}
</script>
