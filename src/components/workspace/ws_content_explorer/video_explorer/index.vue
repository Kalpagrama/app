<template lang="pug">
div(
  v-if="contentKalpa"
  :style=`{position: 'relative', borderRadius: '10px'}`).column.fit.b-50
  content-header(:stateExplorer="stateExplorer")
  //- right panel
  div(
    v-if="$store.state.ui.appFullscreen && $q.screen.gt.sm"
    :style=`{
      position: 'absolute', zIndex: 99999,
      top: '8px',
      right: '8px',
      height: $q.screen.height-120+'px',
    }`).row.justify-start
    content-meta(:stateExplorer="stateExplorer" :resizable="true")
  //- ROW body
  div(
    :style=`{position: 'relative', height: videoHeight+'px', borderRadius: '10px', overflow: 'hidden'}`
    ).row.full-width
    //- composition ADD with currentTime
    q-btn(
      v-if="!stateExplorer.compositionEditing"
      @click="compositionAddClick()"
      round push color="green" icon="add"
      :size="$q.screen.xs ? 'md' : 'lg'"
      :style=`{
        position: 'absolute', zIndex: 9999, bottom: '40px',
        right: $store.state.ui.appFullscreen ? 'calc(50% - 25px)' : '22px',
        borderRadius: '50%',
      }`)
    content-player(:stateExplorer="stateExplorer")
  //- COL bottom meta
  div(
    v-show="!$store.state.ui.appFullscreen"
    ).col.full-width
    .column.fit
      //- div(:style=`{height: '26px'}`).row.full-width
      .col.full-width
        content-meta(:stateExplorer="stateExplorer" :resizable="false")
  //- footer fixed
  div(
    v-if="stateExplorer.pageId !== 'compositions'"
    :style=`{
      position: 'absolute', zIndex: 10000,
      bottom: this.$q.screen.height - this.videoHeight - 26+'px',
      maxWidth: pageContentWidth-80+'px',
      left: 'calc(50% - '+(pageContentWidth-80)/2+'px)',
    }`
    ).row.full-width
    content-progress(:stateExplorer="stateExplorer")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import contentHeader from './content_header'
import contentPlayer from './content_player'
import contentMeta from './content_meta'
import contentProgress from './content_progress'

export default {
  name: 'contentExplorer-video',
  components: {contentHeader, contentPlayer, contentMeta, contentProgress},
  props: ['content'],
  data () {
    return {
      // layout
      contentKalpa: null,
      pageId: 'compositions',
      pages: [
        {id: 'info', name: 'Details', icon: 'details'},
        {id: 'compositions', name: 'Compositions', icon: 'crop_free'},
        {id: 'spheres', name: 'Explore', icon: 'language'},
        // {id: 'people', name: 'People', icon: 'perm_identity'},
        // {id: 'chat', name: 'Chat', icon: 'chat_bubble_outline'},
      ],
      // screenWidth: 1200,
      // videoHeight: 0,
      // pageWidth: 800,
      // pageContentWidth: 680,
      // player
      player: null,
      currentTime: 0,
      duration: 0,
      loadeddata: false,
      playing: false,
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
    pageContentWidth () {
      if (this.$q.screen.width > 680) return 680
      else return this.$q.screen.width - 40 - 40
    },
    stateExplorer () {
      return {
        // layout
        pages: this.pages,
        pageId: this.pageId,
        content: this.contentKalpa,
        contentWs: this.content,
        pageContentWidth: this.pageContentWidth,
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
      let layerStart = this.stateExplorer.currentTime
      let layerEnd = layerStart + 10 > this.stateExplorer.duration ? this.stateExplorer.duration : layerStart + 10
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
