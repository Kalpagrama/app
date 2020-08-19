<template lang="pug">
div(
  :style=`{
    position: 'relative',
    minWidth: pageFullscreen ? $q.screen.width+'px' : pageMinWidth+'px',
    borderRadius: $q.screen.xs ? '0px' : '10px',
    overflow: 'hidden',
  }`
  ).column.full-width.items-center.b-50
  //- header
  div(
    v-show="!pageFullscreen"
    ).row.full-width.items-center.content-center.q-pa-xs
    div(:style=`{overflow: 'hidden',}`).col.q-px-sm
      span(:style=`{whiteSpace: 'nowrap'}`).text-white {{ contentName }}
    //- TODO: open content info: go to original, get name, and some shit
    q-btn(
      round flat dense color="white" icon="more_vert")
  //- content player
  div(:style=`{position: 'relative', borderRadius: '10px',}`).col.full-width
    ws-content-player(
      @ready="storePlayerReady"
      @seeked="compositionPlaying = null"
      :sid="sidPlayer"
      :content="content")
      template(v-slot:controlsTools)
        q-btn(
          @click="pageFullscreen = !pageFullscreen"
          round flat dense color="white"
          :icon="pageFullscreen ? 'fullscreen_exit' : 'fullscreen'")
        q-btn(
          @click="compositionAddStart()"
          round dense color="green" icon="add"
          :style=`{borderRadius: '50%',}`)
  //- page wrapper
  div(:style=`{maxHeight: pageHeight+'px',}`).col.full-width
    .row.fit.items-start.content-start.justify-center
      component(
        v-if="storePlayer && storePlayer.loadeddata"
        :is="`page-${pageId}`"
        :content="content"
        :mode="mode"
        :style=`{ maxWidth: '600px', maxHeight: pageHeight+'px',}`
        @compositionPicked="$emit('compositionPicked', $event), $emit('close')")
  //- footer: pagesController, back, appMenu
  transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
    pages-controller(
      v-show="!pageFullscreen && compositionsSelected.length === 0 && !compositionEditing"
      @close="$emit('close')"
      :style=`{position: 'absolute', zIndex: 1000, bottom: '0px',}`)
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import pagesController from './pages_controller'
import pageDetails from './page_details'
import pageExplore from './page_explore'
import pageCompositions from './page_compositions'

export default {
  name: 'videoExplorer',
  components: {
    pagesController,
    pageDetails,
    pageExplore,
    pageCompositions,
  },
  props: {
    sid: {type: String, default () { return 'videoExplorer' }},
    content: {type: Object},
    value: {type: Object},
    mode: {type: String, default () { return 'standalone' }},
    options: {
      type: Object,
      default () {
        return {
          ctx: 'workspace',
          startAt: null,
        }
      }
    }
  },
  data () {
    return {
      name: '',
      pageHeight: 58,
      pageHeightMini: 58,
      pageHeightMaxi: 500,
      pageFullscreen: false,
      pageId: null, // 'compositions',
      pageIdLast: null,
      storePlayer: null,
      compositionPlaying: null,
      compositionEditing: null,
      compositionsSelected: [],
    }
  },
  computed: {
    pages () {
      return [
        // {id: 'details', name: this.$t('Детали')},
        {id: 'compositions', name: this.$t('videoExplorer_nodesMine', 'Мои ядра')},
        {id: 'explore', name: this.$t('videoExplorer_nodesKalpa', 'Ядра')},
      ]
    },
    sidPlayer () {
      return `${this.sid}-storePlayer`
    },
    pageMinWidth () {
      if (this.$q.screen.width > 800) return 800
      else return this.$q.screen.width
    },
    contentName () {
      return this.content.name.slice(0, 40)
    }
  },
  provide () {
    return {
      sidExplorer: this.sid,
      sidPlayer: this.sidPlayer
    }
  },
  watch: {
    pageId: {
      immediate: false,
      handler (to, from) {
        if (to) {
          this.pageHeight = this.$q.screen.height * 0.55
        }
        else {
          // this.pageHeight = 36
        }
      }
    },
    pageFullscreen: {
      handler (to, from) {
        if (to) {
          this.$log('pageFullscreen ON', this.pageId, this.pageIdLast)
          this.pageIdLast = this.pageId
          this.pageId = null
          this.pageHeight = 0
        }
        else {
          this.$log('pageFullscreen OFF', this.pageId, this.pageIdLast)
          if (this.pageIdLast) this.pageId = this.pageIdLast
          else this.pageHeight = this.pageHeightMini
        }
      }
    },
  },
  methods: {
    storePlayerReady () {
      this.$log('storePlayerReady')
      this.storePlayer = window.stores[this.sidPlayer]
      // start at when exploring composition.content...
      if (this.options && this.options.startAt) {
        this.$log('this.options.startAt', this.options.startAt)
        this.storePlayer.setCurrentTime(this.options.startAt)
      }
    },
    async compositionAddStart () {
      this.$log('compositoinAddStart start')
      let composition = await this.compositionAdd()
      this.$log('composition', composition)
      this.pageId = 'compositions'
      this.$nextTick(() => {
        this.compositionEditing = composition.id
        // this.compositionPlaying = composition.id
        this.$log('compositionAddStart done')
      })
    },
    async compositionAdd () {
      this.$log('nodeAdd')
      this.storePlayer.pause()
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
      this.$emit('compositionAdded', res)
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
    // if (this.options.ctx === 'explorer') this.pageId = 'explore'
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    if (!module.hot) delete window.stores[this.sid]
  }
}
</script>
