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
      @click="compositionAddClick()"
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
      div(:style=`{height: '26px'}`).row.full-width
      //- kalpa-debug(:options=`{compositionSelected,compositionEditing}`)
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

export default {
  name: 'contentExplorer-video',
  components: {contentPlayer, contentMeta, contentProgress},
  props: ['content'],
  data () {
    return {
      contentKalpa: null,
      player: null,
      currentTime: 0,
      duration: 0,
      loadeddata: false,
      playing: false,
      pageId: 'compositions',
      pages: [
        {id: 'info', name: 'Details', icon: 'details'},
        {id: 'compositions', name: 'Fragments', icon: 'crop_free'},
        {id: 'spheres', name: 'Explore', icon: 'language'},
        // {id: 'people', name: 'People', icon: 'perm_identity'},
        // {id: 'chat', name: 'Chat', icon: 'chat_bubble_outline'},
      ],
      // composition
      composition: null,
      compositionSelected: null,
      compositionEditing: null
    }
  },
  computed: {
    videoHeight () {
      if (this.$store.state.ui.appFullscreen) return this.$q.screen.height - 43
      else return this.$q.screen.height * 0.4
    },
    footerBottom () {
      return this.$q.screen.height - this.videoHeight - 26
    },
    footerWidth () {
      if (this.$q.screen.width > 600) return 600
      else return this.$q.screen.width - 80
    },
    footerLeft () {
      if (this.$q.screen.width > 600) return `calc(50% - ${this.footerWidth / 2}px)`
      else return `calc(50% - ${this.footerWidth / 2}px)`
    },
    stateExplorer () {
      return {
        pages: this.pages,
        pageId: this.pageId,
        content: this.contentKalpa,
        contentWs: this.content,
        // player
        player: this.player,
        duration: this.duration,
        currentTime: this.currentTime,
        loadeddata: this.loadeddata,
        playing: this.playing,
        // composition
        composition: this.composition,
        compositionSelected: this.compositionSelected,
        compositionEditing: this.compositionEditing,
        compositionAdd: this.compositionAdd,
        compositionAddClick: this.compositionAddClick,
        set: (key, val) => {
          this[key] = val
        }
      }
    }
  },
  watch: {
    'stateExplorer.currentTime': {
      handler (to, from) {
      }
    }
  },
  methods: {
    async compositionAddClick () {
      this.$log('compositionAddClick')
      let composition = await this.compositionAdd()
      this.stateExplorer.set('composition', composition)
      this.stateExplorer.set('compositionSelected', composition.id)
      this.stateExplorer.set('compositionEditing', composition.id)
    },
    async compositionAdd () {
      this.$log('nodeAdd')
      let layerId = Date.now().toString()
      let layerColor = this.$randomColor(layerId)
      let compositionInput = {
        wsItemType: 'WS_CONTENT',
        contentOid: this.stateExplorer.content.oid,
        contentType: 'COMPOSITION',
        thumbOid: this.stateExplorer.content.thumbUrl,
        name: '',
        layers: [
          {
            id: layerId,
            color: layerColor,
            contentOid: this.stateExplorer.content.oid,
            figuresAbsolute: [
              {t: this.stateExplorer.currentTime, points: []},
              {t: this.stateExplorer.currentTime + 10, points: []}
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
  async mounted () {
    this.$log('mounted')
    this.contentKalpa = await this.$rxdb.get(RxCollectionEnum.OBJ, this.content.contentOid)
    // if (this.$q.screen.xs) this.$store.commit('ui/stateSet', ['appFullscreen', true])
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    this.$store.commit('ui/stateSet', ['appFullscreen', false])
  }
}
</script>
