<template lang="pug">
div(
  :style=`{
    position: 'relative',
    //- minWidth: pageFullscreen ? $q.screen.width+'px' : 800+'px',
    borderRadius: '10px', overflow: 'hidden',
  }`
  ).row.full-width.b-50
  q-resize-observer(@resize="height = $event.height")
  //- mode: EDITOR
  div(v-if="options.mode === 'editor'" :style=`{position: 'relative'}`).column.fit
    //- body
    div(v-if="!sidPlayerReady" :style=`{position: 'relative'}`).col.full-width
      //- close btn
      q-btn(
        v-if="true"
        @click="close()"
        round flat color="white" icon="keyboard_arrow_left"
        :style=`{position: 'absolute', zIndex: 1000, top: '8px', left: '8px'}`)
      ws-content-player(
        :sid="sidPlayer" :content="content"
        @seeked="storeEditor.compositionPlaying = false"
        @ready="storePlayerReady")
        template(v-slot:controlsTools)
          //- q-btn(
          //-   @click="pageFullscreen = !pageFullscreen"
          //-   round flat dense color="white"
          //-   :icon="pageFullscreen ? 'fullscreen_exit' : 'fullscreen'")
    //- body: pages
    div(
      :style=`{
        position: 'relative', maxHeight: sidPlayerReady ? '100%' : pageHeight+'px',
        paddingBottom: layerEditing ? '0px' : '0px',
      }`).col.full-width
      div(v-if="sidPlayerReady ? true : storePlayer && storePlayer.loadeddata").row.fit.justify-center
        page-details(
          v-if="pageId === 'details'"
          :composition="composition"
          :content="content"
          :style=`{maxWidth: '600px', overflow: 'hidden'}`)
        page-edit(
          v-if="pageId === 'edit'"
          :composition="composition"
          :content="content"
          @close="close()")
    //- footer: pages control
    //- transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
    //-   pages-controller(
    //-     v-if="pageHeight > 40 && !layerEditing"
    //-     @close="close()"
    //-     :style=`{
    //-       position: 'absolute', zIndex: 1000, bottom: '0px',
    //-     }`)
  //- mode: PLAYER
  div(v-if="options.mode === 'player'" :style=`{position: 'relative'}`).row.fit
    ws-content-player(@ready="storePlayerReady" :sid="sidPlayer" :content="content" :options=`{controls: false}`)
    composition-progress(
      v-if="storePlayer && storePlayer.loadeddata"
      v-show="!options.mini && false"
      :composition="composition" :options="options"
      :style=`{position: 'absolute', zIndex: 1000, bottom: '0px', opacity: 0.6}`)
  //- mode: PROGRESS
  div(v-if="options.mode === 'progress'").row.full-width
    composition-progress(
      v-if="storePlayer && storePlayer.loadeddata"
      :composition="composition" :style=`{maxWidth: '600px'}`).full-width
      template(v-slot:progressActions)
        slot(name="progressActions")
      template(v-slot:progressBar)
        slot(name="progressBar")
  //- header
  //- div(
  //-   v-show="!options.isPreview && !pageFullscreen"
  //-   :style=`{}`).row.full-width.b-60
  //-   q-input(
  //-     v-model="composition.name"
  //-     filled dark color="grey-2"
  //-     :input-style=`{fontWeight: 'bold'}`
  //-     :style=`{fontWeight: 'bold'}`
  //-     @focus="pageHeight = 0"
  //-     @blur="pageHeight = $q.screen.height * 0.5"
  //-     ).full-width.text-bold
  //-     template(v-slot:prepend)
  //-       q-btn(
  //-         @click="$emit('close')"
  //-         round flat color="white" icon="keyboard_arrow_left")
</template>

<script>
import pageDetails from './page_details'
import pageEdit from './page_edit'
import pagesController from './pages_controller'
import compositionProgress from './composition_progress'

export default {
  name: 'videoEditor',
  components: {
    pageDetails,
    pageEdit,
    pagesController,
    compositionProgress
  },
  props: {
    sid: {type: String, default () { return 'wce' }},
    composition: {type: Object},
    content: {type: Object},
    sidPlayerReady: {type: Object},
    options: {
      type: Object,
      default () {
        return {
          mode: 'editor',
          isPreview: false,
          active: true,
          mini: false,
        }
      }
    },
  },
  data () {
    return {
      height: 0,
      pageHeight: 0,
      pageFullscreen: false,
      pageId: 'edit',
      pages: [
        {id: 'details', name: 'Details'},
        {id: 'edit', name: 'Edit'},
      ],
      compositionName: '',
      storePlayer: null,
      compositionPlaying: true,
      layerActive: 0,
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
      if (this.sidPlayerReady) return this.sidPlayerReady
      else return `${this.sid}-storePlayer`
    },
    pageMinWidth () {
      // if (this.$q.screen.width > 800) return 800
      // else return this.$q.screen.width
      // if (this.$el.clientWidth > 800) return 800
      // else return this.$el.clientWidth
      return this.$q.screen.width
    },
  },
  watch: {
    pageId: {
      immediate: true,
      handler (to, from) {
        if (to === 'details') this.pageHeight = this.height * 0.5
        else if (to === 'edit') this.pageHeight = this.height * 0.5
        else this.pageHeight = 0
      }
    },
    pageFullscreen: {
      immediate: false,
      handler (to, from) {
        if (to) this.pageHeight = 0
        else this.pageHeight = this.height * 0.5
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
    close () {
      this.$log('close')
      if (this.composition.layers.length === 0) {
        if (confirm('Вы не добавили ни одного образа, закрыть?')) {
          this.$emit('close')
        }
      }
      this.$emit('close')
    },
  },
  created () {
    this.$log('created')
    this.$log('created window.stores', window.stores)
    window.stores[this.sid] = this
    if (this.sidPlayerReady) {
      this.storePlayerReady()
    }
  },
  async mounted () {
    this.$log('mounted', this.$el.clientHeight)
    this.pageHeight = this.height * 0.5
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    if (!module.hot) delete window.stores[this.sid]
  }
}
</script>
