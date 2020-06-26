<template lang="pug">
div(
  :style=`{
    position: 'relative',
    minWidth: pageFullscreen ? $q.screen.width+'px' : pageMinWidth+'px',
  }`
  ).column.full-width.b-50
  //- close btn
  q-btn(
    @click="$emit('close')"
    round flat color="white" icon="keyboard_arrow_left"
    :style=`{position: 'absolute', zIndex: 1000, top: '8px', left: '8px'}`)
  //- header
  div(
    v-show="false && !pageFullscreen"
    :style=`{height: '60px', paddingLeft: '60px',}`).row.full-width.items-center.content-center.b-60
    span.text-white.text-bold {{ value.name }}
  //- content player
  div(:style=`{position: 'relative', borderRadius: '10px', overflow: 'hidden'}`).col.full-width.br
    q-btn(
      v-if="!compositionEditing"
      @click="compositionAddStart()"
      round push color="green" icon="add" size="md"
      :style=`{
        position: 'absolute', zIndex: 99999,
        bottom: '12px',
        right: '12px',
        borderRadius: '50%',
      }`)
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
      //-   composition-name-init(v-if="pageId === 'compositions'")
  //- page
  div(:style=`{height: pageHeight+'px'}`).row.full-width
    div(v-if="storePlayer && storePlayer.loadeddata").row.fit.justify-center
      page-details(
        v-if="pageId === 'details'"
        :content="content"
        :style=`{maxWidth: '600px', overflow: 'hidden'}`)
      page-explore(
        v-if="pageId === 'explore'"
        :content="content"
        :style=`{maxWidth: '600px', overflow: 'hidden'}`)
      page-compositions(
        v-if="pageId === 'compositions'"
        :content="content"
        :style=`{maxWidth: '600px', overflow: 'hidden'}`)
  //- footer
  transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
    pages-controller(
      v-show="!pageFullscreen && compositionsSelected.length === 0 && !compositionEditing"
      :style=`{
        position: 'absolute', zIndex: 1000, bottom: '0px',
      }`
      @close="$emit('close')")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import pagesController from './pages_controller'
import pageDetails from './page_details'
import pageExplore from './page_explore'
import pageCompositions from './page_compositions'
import compositionNameInit from './composition_name_init'

export default {
  name: 'videoExplorer',
  components: {
    pagesController,
    pageDetails,
    pageExplore,
    pageCompositions,
    compositionNameInit
  },
  props: {
    sid: {type: String, default () { return 'videoExplorer' }},
    content: {type: Object},
    value: {type: Object},
    options: {
      type: Object,
      default () {
        return {
          ctx: 'workspace',
        }
      }
    }
  },
  data () {
    return {
      name: '',
      pageHeight: 0,
      pageFullscreen: false,
      pageId: 'compositions',
      pages: [
        {id: 'details', name: 'Детали'},
        {id: 'compositions', name: 'Образы'},
        {id: 'explore', name: 'Поиск'},
      ],
      storePlayer: null,
      compositionPlaying: null,
      compositionEditing: null,
      compositionsSelected: [],
    }
  },
  computed: {
    sidPlayer () {
      return `${this.sid}-storePlayer`
    },
    pageMinWidth () {
      if (this.$q.screen.width > 800) return 800
      else return this.$q.screen.width
    },
  },
  provide () {
    return {
      sidExplorer: this.sid,
      sidPlayer: this.sidPlayer
    }
  },
  watch: {
    pageId: {
      immediate: true,
      handler (to, from) {
        if (to === 'details') this.pageHeight = this.$q.screen.height * 0.5
        else if (to === 'explore') this.pageHeight = this.$q.screen.height * 0.7
        else if (to === 'compositions') this.pageHeight = this.$q.screen.height * 0.6
        else this.pageHeight = 0
      }
    },
    pageFullscreen: {
      handler (to, from) {
        if (to) this.pageHeight = 0
        else this.pageHeight = this.$q.screen.height * 0.5
      }
    },
  },
  methods: {
    storePlayerReady () {
      this.$log('storePlayerReady')
      this.storePlayer = window.stores[this.sidPlayer]
    },
    async compositionAddStart () {
      this.$log('compositoinAddStart start')
      let composition = await this.compositionAdd()
      this.$log('composition', composition)
      this.pageId = 'compositions'
      // this.compositionPlaying = composition.id
      this.compositionEditing = composition.id
      this.$log('compositionAddStart done')
    },
    async compositionAdd () {
      this.$log('nodeAdd')
      let layerId = Date.now().toString()
      let layerColor = this.$randomColor(layerId)
      let layerStart = this.storePlayer.currentTime
      let layerEnd = layerStart + 10 > this.storePlayer.duration ? this.storePlayer.duration : layerStart + 10
      let compositionInput = {
        wsItemType: 'WS_CONTENT',
        contentOid: this.content.oid,
        contentType: 'COMPOSITION',
        thumbOid: this.content.thumbUrl,
        name: '',
        layers: [
          {
            id: layerId,
            color: layerColor,
            contentOid: this.content.oid,
            figuresAbsolute: [
              {t: layerStart, points: []},
              {t: layerEnd, points: []}
            ],
            figuresRelative: [],
            spheres: []
          }
        ],
        spheres: [],
        operation: { items: null, operations: null, type: 'CONCAT' }
      }
      let res = await this.$rxdb.set(RxCollectionEnum.WS_CONTENT, compositionInput)
      this.$log('res', res)
      return res
    },
  },
  created () {
    this.$log('created')
    // this.$log('created window.stores', window.stores)
    window.stores[this.sid] = this
  },
  async mounted () {
    this.$log('mounted')
    if (this.options.ctx === 'explorer') this.pageId = 'explore'
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    if (!module.hot) delete window.stores[this.sid]
  }
}
</script>
