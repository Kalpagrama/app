<template lang="pug">
div(
  :style=`{
    position: 'relative',
    minWidth: pageFullscreen ? $q.screen.width+'px' : pageMinWidth+'px',
    borderRadius: '10px', overflow: 'hidden',
  }`
  ).column.full-width.b-50
  q-btn(
    round flat color="white" icon="keyboard_arrow_left"
    :style=`{position: 'absolute', zIndex: 1000, top: '8px', left: '8px'}`)
  .col.full-width
    ws-content-player(
      @ready="storePlayerReady"
      :sid="sidPlayer"
      :content="content")
      template(v-slot:controlsTools)
        q-btn(
          @click="pageFullscreen = !pageFullscreen"
          round flat dense color="white"
          :icon="pageFullscreen ? 'fullscreen_exit' : 'fullscreen'")
      //- template(v-slot:controls)
      //-   div(
      //-     v-if="false"
      //-     :style=`{}`).row.full-width.q-pt-xs
      //-     q-input(
      //-       v-model="composition.name"
      //-       filled dense dark color="white"
      //-       label="What do you see?"
      //-       :style=`{
      //-         background: 'rgba(60,60,60,0.5)',
      //-       }`).full-width
      //-       template(v-slot:prepend)
      //-         kalpa-avatar(:url="$store.getters.currentUser().profile.photoUrl" :width="20" :height="20")
      //-       template(v-slot:append)
      //-         q-btn(
      //-           v-if="composition.name.length > 0"
      //-           @click="toggleEdit"
      //-           round flat dense color="grey-5"
      //-           :icon="pageFullscreen ? 'check' : 'keyboard_arrow_down'")
  //- editor tools
  div(
    :style=`{position: 'relative', overflow: 'hidden', height: pageHeight+'px'}`).row.full-width.justify-center
    div(v-if="storePlayer && storePlayer.loadeddata").row.fit.justify-center
      page-details(
        v-if="pageId === 'details'"
        :composition="composition"
        :content="content"
        :style=`{maxWidth: '600px', overflow: 'hidden'}`)
      page-edit(
        v-if="pageId === 'edit'"
        :composition="composition"
        :content="content")
    //- div(:style=`{position: 'relative', maxWidth: '600px', overflow: 'hidden'}`).column.fit
    //-   h1.text-white details
    //- div(:style=`{position: 'absolute', maxWidth: '600px', overflow: 'hidden'}`).column.fit
    //-   .col.full-width.scorll
    //-     div(v-for="(l,li) in 10" :key="li").row.full-width
    //-   .row.full-width.bg
    //-     .col
    //-     q-btn(round flat dense color="green" icon="check" @click="pageFullscreen = true")
    //- page-details(
    //-   v-if="state.pageId === 'details'"
    //-   :composition="composition"
    //-   :content="content"
    //-   :style=`{maxWidth: 600+'px'}`)
    //- page-editor(
    //-   v-if="stateEditor.pageId === 'editor'"
    //-   @createNode="$emit('createNode')"
    //-   @close="$emit('close')"
    //-   @delete="$emit('delete')"
    //-   :composition="composition"
    //-   :options="options"
    //-   :style=`{maxWidth: stateEditor.pageWidth+'px'}`)
    //- //- all components
    //- div(
    //-   v-if="!options.onlyProgress"
    //-   :style=`{paddingTop: '24px'}`).row.fit.justify-center
    //-   editor(
    //-     v-if="stateExplorer.player"
    //-     @createNode="$emit('createNode')"
    //-     @close="$emit('close')"
    //-     @delete="$emit('delete')"
    //-     :options="options"
    //-     :stateExplorer="stateExplorer"
    //-     :style=`{maxWidth: '600px'}`)
    //- //- only progress
    //- div(
    //-   v-if="options.onlyProgress"
    //-   :style=`{
    //-     position: 'relative',
    //-     minHeight: '40px',
    //-   }`
    //-   ).row.full-width
    //-   composition-progress(
    //-     :value="composition" :active="false"
    //-     :stateExplorer="stateExplorer"
    //-     ).fit
    //-     template(v-slot:actions)
    //-       slot(name="actions")
  pages-controller(
    v-if="pageHeight > 40")
</template>

<script>
import pageDetails from './page_details'
// import pageEditor from './page_editor'
import pageEdit from './page_edit'
import pagesController from './pages_controller'
import compositionController from './composition_controller'
import compositionProgress from './composition_progress'

export default {
  name: 'videoEditor',
  components: {
    pageDetails,
    pageEdit,
    pagesController,
    compositionController,
    compositionProgress
  },
  props: {
    sid: {type: String, default () { return 'wce' }},
    composition: {type: Object},
    content: {type: Object},
    storePlayerRaw: {type: Object}
  },
  data () {
    return {
      pageHeight: 0,
      pageFullscreen: false,
      pageId: 'edit',
      pages: [
        {id: 'details', name: 'Details'},
        {id: 'edit', name: 'Edit'},
      ],
      compositionName: '',
      storePlayer: null,
      compositionPlaying: false,
      layerPlaying: null,
      layerEditing: null,
    }
  },
  provide () {
    return {
      sidEditor: this.sid,
      sidPlayer: this.sidPlayer
    }
  },
  computed: {
    sidPlayer () {
      return `${this.sid}-storePlayer`
    },
    storeApp () {
      return window.stores.storeApp
    },
    pageMinWidth () {
      if (this.$q.screen.width > 800) return 800
      else return this.$q.screen.width
    },
  },
  watch: {
    pageId: {
      immediate: true,
      handler (to, from) {
        if (to === 'details') this.pageHeight = this.$q.screen.height * 0.5
        else if (to === 'edit') this.pageHeight = this.$q.screen.height * 0.5
        else this.pageHeight = 0
      }
    },
    pageFullscreen: {
      handler (to, from) {
        if (to) this.pageHeight = 0
        else this.pageHeight = this.$q.screen.height * 0.5
      }
    },
    'storePlayer.playing': {
      handler (to, from) {
        this.$log('storePlayer.playing TO', to)
      }
    },
  },
  methods: {
    storePlayerReady () {
      this.$log('storePlayerReady')
      this.storePlayer = window.stores[this.sidPlayer]
    },
    toggleEdit () {
      this.$log('toggleEdit')
      if (this.pageHeight === 500) {
        this.pageHeight = 0
      }
      else {
        this.pageHeight = 500
        this.pageId = 'edit'
        this.pageFullscreen = false
      }
    },
    layerAdd () {
      this.$log('layerAdd')
      let layerIndex = this.composition.layers.length
      let layerId = Date.now().toString()
      let layerColor = this.$randomColor(layerId)
      let layerStart = this.storePlayer.currentTime
      let layerEnd = layerStart + 10 > this.storePlayer.duration ? this.storePlayer.duration : layerStart + 10
      if (layerEnd > this.storePlayer.duration) alert('layerEnd > this.stateEditor.duration')
      let layerInput = {
        id: layerId,
        color: layerColor,
        contentOid: this.content.oid,
        figuresAbsolute: [
          {t: layerStart, points: []},
          {t: layerEnd, points: []},
        ],
        figuresRelative: [],
        spheres: []
      }
      this.$set(this.composition.layers, layerIndex, layerInput)
      return layerId
    },
  },
  created () {
    this.$log('created')
    this.$log('created window.stores', window.stores)
    window.stores[this.sid] = this
  },
  async mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    if (!module.hot) delete window.stores[this.sid]
  }
}
</script>
