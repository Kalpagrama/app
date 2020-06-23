<style lang="sass" scoped>
.video-explorer
  position: relative
  max-width: 800px
  width: 100%
.video-explorer-fullscreen
  position: fixed
  z-index: 999999
  top: 0
  left: 0
  right: 0
  bottom: 0
  width: 100vw
  min-width: 100vw
  height: 100vh
</style>

<template lang="pug">
div(
  v-if="contentKalpa"
  :class=`{
    'video-explorer': !stateExplorer.pageFullscreen,
    'video-explorer-fullscreen': stateExplorer.pageFullscreen,
  }`
  :style=`{
    borderRadius: $store.state.ui.borderRadius+'px'
  }`
  ).column.b-50
  transition(appear enter-active-class="animated slideInDown" leave-active-class="animated slideOutUp")
    content-header(
      v-if="!stateExplorer.playing"
      @close="$emit('close')"
      :stateExplorer="stateExplorer")
  //- right panel
  //- div(
  //-   v-if="stateExplorer.pageFullscreen && $q.screen.gt.sm"
  //-   :style=`{
  //-     position: 'absolute', zIndex: 99999,
  //-     top: '8px',
  //-     right: '8px',
  //-     height: $q.screen.height-120+'px',
  //-   }`).row.justify-start
  //-   content-meta(:stateExplorer="stateExplorer" :resizable="true")
  //- ROW body
  div(
    :style=`{position: 'relative', height: videoHeight+'px', borderRadius: $store.state.ui.borderRadius+'px', overflow: 'hidden'}`
    ).row.full-width
    //- composition ADD at currentTime
    q-btn(
      v-if="compositionAddBtnShow"
      @click="compositionAddClick()"
      round flat color="green" icon="add"
      :size="$q.screen.xs ? 'md' : 'lg'"
      :style=`{
        position: 'absolute', zIndex: 9999, bottom: '60px',
        right: 'calc(50% - 25px)',
        borderRadius: '50%',
      }`)
    content-player(:stateExplorer="stateExplorer")
  //- COL bottom meta
  .col.full-width
    content-meta(:stateExplorer="stateExplorer" :resizable="false")
  //- footer fixed
  div(
    :style=`{
      position: 'absolute', zIndex: 10000,
      bottom: $q.screen.height - videoHeight - 26+'px',
    }`
    ).row.full-width.items-start.content-start.justify-center
    content-progress(
      v-if="stateExplorer.pageId !== 'compositions'"
      :stateExplorer="stateExplorer"
      :style=`{
        maxWidth: pageContentWidth-80+'px',
      }`)
    //- resize video height
    q-btn(
      v-if="false"
      round flat dense color="white" icon="unfold_more"
      :style=`{
        position: 'absolute', left: '4px', zIndex: 12000,
        bottom: '6px',
      }`)
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
  props: ['ctx', 'content'],
  data () {
    return {
      // layout
      contentKalpa: null,
      pageId: null,
      pages: [
        {id: 'info', name: 'Details', icon: 'details'},
        {id: 'compositions', name: 'Compositions', icon: 'crop_free'},
        {id: 'spheres', name: 'Explore', icon: 'language'},
        // {id: 'people', name: 'People', icon: 'perm_identity'},
        // {id: 'chat', name: 'Chat', icon: 'chat_bubble_outline'},
      ],
      pageFullscreen: false,
      videoHeight: 300,
      // screenWidth: 1200,
      // videoHeight: 0,
      // pageWidth: 800,
      // pageContentWidth: 680,
      // player
      player: null,
      playing: false,
      loadeddata: false,
      currentTime: 0,
      duration: 0,
      // composition
      composition: null,
      compositionSelected: null,
      compositionEditing: null
    }
  },
  computed: {
    // videoHeight () {
    //   // if (this.$store.state.ui.appFullscreen) return this.$q.screen.height - 43
    //   // else return this.$q.screen.height * 0.4
    //   return this.$q.screen.height * 0.8
    // },
    pageContentWidth () {
      if (this.$q.screen.width > 680) return 680
      else return this.$q.screen.width
    },
    compositionAddBtnShow () {
      return !this.stateExplorer.compositionEditing
    },
    stateExplorer () {
      return {
        // layout
        pages: this.pages,
        pageId: this.pageId,
        content: this.contentKalpa,
        contentWs: this.content,
        pageContentWidth: this.pageContentWidth,
        pageFullscreen: this.pageFullscreen,
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
    pageId: {
      immediate: true,
      handler (to, from) {
        this.$log('pageId TO', to)
        if (to === 'compositions') this.videoHeight = this.$q.screen.height * 0.4
        else if (to === 'info') this.videoHeight = this.$q.screen.height * 0.3
        else if (to === 'spheres') this.videoHeight = this.$q.screen.height * 0.3
        else if (to === null) this.videoHeight = this.$q.screen.height - 60
      }
    }
  },
  methods: {
    async compositionAddClick () {
      this.$log('compositionAddClick')
      let composition = await this.compositionAdd()
      this.stateExplorer.set('pageId', 'compositions')
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
    // this.videoHeight = this.$q.screen.height - 60
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
