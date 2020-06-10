<template lang="pug">
div(
  v-if="contentKalpa"
  :style=`{position: 'relative', borderRadius: '10px'}`).column.fit.b-50
  //- content name
  div(
    :style=`{
      position: 'absolute', zIndex: 99999, top: '8px', left: '8px',
      height: '60px',
      borderRadius: '10px', overflow: 'hidden',
      background: $q.screen.xs ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)',
      maxWidth: 'calc(100% - 16px)',
    }`).row.items-center.content-center
    q-btn(
      round flat color="white" icon="keyboard_arrow_left" @click="$router.back()"
      :style=`{
      }`)
    .col
      .row.fit.items-center.q-px-sm
        span(
          v-if="true"
          ).text-white.text-bold {{ content.name }}
  //- right panel
  div(
    v-if="$store.state.ui.appFullscreen && $q.screen.gt.sm"
    :style=`{
      position: 'absolute', zIndex: 99999,
      top: '8px',
      right: '8px',
      height: $q.screen.height-120+'px',
    }`).row.justify-start
    content-meta(
      :stateExplorer="stateExplorer"
      :resizable="true")
  //- body
  div(:style=`{position: 'relative', height: videoHeight+'px', borderRadius: '10px', overflow: 'hidden'}`).row.full-width
    //- layer ADD
    q-btn(
      @click="layerAddBtnClick"
      round push color="green" icon="add"
      :size="$q.screen.xs ? 'md' : 'lg'"
      :style=`{
        position: 'absolute', zIndex: 9999, bottom: '40px',
        right: $store.state.ui.appFullscreen ? 'calc(50% - 25px)' : '22px',
        borderRadius: '50%',
      }`)
    content-player(
      :stateExplorer="stateExplorer"
      :style=`{
      }`)
  //- bottom meta
  div(v-show="!$store.state.ui.appFullscreen").col.full-width
    .column.fit
      div(:style=`{height: '50px'}`).row.full-width
      .col.full-width
        content-meta(
          :stateExplorer="stateExplorer"
          :resizable="false"
          )
  //- footer fixed
  div(
    :style=`{
      position: 'absolute', zIndex: 10000,
      bottom: footerBottom+'px',
      maxWidth: footerWidth+'px',
      left: footerLeft,
    }`
    ).row.full-width
    layer-editor(
      v-if="false"
      :stateExplorer="stateExplorer"
      @close="layerEditorOpened = false")
    content-progress(
      :statePage="statePage"
      :stateExplorer="stateExplorer")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import contentPlayer from './content_player'
import contentMeta from './content_meta'
import contentProgress from './content_progress'
import layerEditor from './layer_editor'

export default {
  name: 'contentExplorer-video',
  components: {contentPlayer, contentMeta, contentProgress, layerEditor},
  props: ['content'],
  data () {
    return {
      contentKalpa: null,
      player: null,
      currentTime: 0,
      duration: 0,
      loadeddata: false,
      playing: false,
      pageId: 'layers',
      pages: [
        {id: 'info', name: 'Info', icon: 'details'},
        {id: 'layers', name: 'Layers', icon: 'layers'},
        {id: 'nodes', name: 'Nodes', icon: 'hdr_strong'},
        {id: 'spheres', name: 'Spheres', icon: 'blur_on'},
        {id: 'people', name: 'People', icon: 'perm_identity'},
        {id: 'chat', name: 'Chat', icon: 'chat_bubble_outline'},
      ],
      layerEditorOpened: false,
      layerSelected: null,
      layerEditing: null,
      layersSelected: []
    }
  },
  computed: {
    videoHeight () {
      if (this.$store.state.ui.appFullscreen) return this.$q.screen.height - 53
      else return this.$q.screen.height * 0.4
    },
    footerBottom () {
      return this.$q.screen.height - this.videoHeight - 53
    },
    footerWidth () {
      if (this.$q.screen.width > 600) return 600
      else return this.$q.screen.width - 50
    },
    footerLeft () {
      if (this.$q.screen.width > 600) return `calc(50% - ${this.footerWidth / 2}px)`
      else return `calc(50% - ${this.footerWidth / 2}px)`
    },
    layer () {
      return this.content.layers.find(layer => layer.id === this.layerSelected)
    },
    layerStart () {
      return this.layer?.figuresAbsolute[0].t
    },
    layerEnd () {
      return this.layer?.figuresAbsolute[1].t
    },
    layerDuration () {
      return this.layerEnd - this.layerStart
    },
    stateExplorer () {
      return {
        pageId: this.pageId,
        pages: this.pages,
        content: this.contentKalpa,
        contentWs: this.content,
        player: this.player,
        duration: this.duration,
        currentTime: this.currentTime,
        loadeddata: this.loadeddata,
        playing: this.playing,
        layer: this.layer,
        layerStart: this.layerStart,
        layerEnd: this.layerEnd,
        layerDuration: this.layerDuration,
        layerEditorOpened: false,
        layerSelected: this.layerSelected,
        layerEditing: this.layerEditing,
        layersSelected: this.layersSelected,
        layerAdd: this.layerAdd,
        set: (key, val) => {
          this[key] = val
        }
      }
    }
  },
  watch: {
    'stateExplorer.currentTime': {
      handler (to, from) {
        let layer = this.stateExplorer.layer
        if (layer) {
          if (to > layer.figuresAbsolute[1].t) {
            this.stateExplorer.player.setCurrentTime(layer.figuresAbsolute[0].t)
          }
          if (to < layer.figuresAbsolute[0].t) {
            this.stateExplorer.player.setCurrentTime(layer.figuresAbsolute[0].t)
          }
        }
      }
    }
  },
  methods: {
    async layerAddBtnClick () {
      this.$log('layerAddBtnClick')
      let layerId = await this.stateExplorer.layerAdd()
      this.stateExplorer.set('layerSelected', layerId)
      this.stateExplorer.set('layerEditing', layerId)
    },
    layerAdd (layerInput) {
      this.$log('layerAdd')
      if (!layerInput) {
        let start = this.stateExplorer.currentTime
        let end = start + 10 > this.stateExplorer.duration ? this.stateExplorer.duration : start + 10
        layerInput = {
          contentOid: this.stateExplorer.content.oid,
          figuresAbsolute: [
            {t: start, points: []},
            {t: end, points: []}
          ],
          figuresRelative: [],
          spheres: []
        }
      }
      // make layer input
      let layerIndex = this.stateExplorer.contentWs.layers.length
      let layerId = Date.now().toString()
      layerInput.id = layerId
      layerInput.color = this.$randomColor(layerId)
      this.$log('layerAdd layerInput', layerInput)
      // set layer
      this.$set(this.stateExplorer.contentWs.layers, layerIndex, layerInput)
      this.$log('layerAdd done')
      return layerId
    },
  },
  async mounted () {
    this.$log('mounted')
    this.contentKalpa = await this.$rxdb.get(RxCollectionEnum.OBJ, this.content.contentOid)
    if (this.$q.screen.xs) this.$store.commit('ui/stateSet', ['appFullscreen', true])
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    this.$store.commit('ui/stateSet', ['appFullscreen', false])
  }
}
</script>
