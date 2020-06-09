<template lang="pug">
div(
  v-if="contentKalpa"
  :style=`{position: 'relative', borderRadius: '10px'}`).column.fit.b-50
  //- left panel
  div(
    :style=`{
      position: 'absolute', zIndex: 99999, top: '8px', left: '8px',
      borderRadius: '10px', overflow: 'hidden',
      background: 'rgba(0,0,0,0.5)',
      maxWidth: '100%',
    }`).row.items-center.content-center
    q-btn(
      round flat color="white" icon="keyboard_arrow_left" @click="$router.back()"
      :style=`{
      }`)
    span(
      v-if="stateExplorer.playing"
      ).text-white.text-bold.q-mx-sm {{ content.name }}
  //- right panel
  //- right: $store.state.ui.appFullscreen ? '8px' : -$store.state.ui.panelMaxWidth+'px',
  div(
    v-if="$store.state.ui.appFullscreen && $q.screen.gt.md"
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
    q-btn(
      round push color="green" icon="add"
      size="md"
      :style=`{
        position: 'absolute', zIndex: 9999, bottom: '40px',
        right: '22px',
        borderRadius: '50%',
      }`)
    content-player(
      :stateExplorer="stateExplorer"
      :style=`{
      }`)
  div(v-if="!$store.state.ui.appFullscreen").col.full-width
    .column.fit
      div(:style=`{height: '50px'}`).row.full-width
      .col.full-width
        content-meta(
          :stateExplorer="stateExplorer"
          :resizable="false"
          )
      //- footer
      div(
        v-if="false"
        :style=`{borderRadius: '10px 10px 0 0',}`).row.full-width.q-pa-sm.b-70
        q-btn(round flat dense color="white" icon="menu")
        .col
        q-btn(round flat dense color="white" icon="menu_open")
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
      @close="layerEditorOpened = false"
      )
    content-progress(
      :statePage="statePage"
      :stateExplorer="stateExplorer"
      )
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
        {id: 'layers', name: 'Layers', icon: 'layers'},
        {id: 'nodes', name: 'Nodes', icon: 'hdr_strong'},
        {id: 'spheres', name: 'Spheres', icon: 'blur_on'},
        {id: 'people', name: 'People', icon: 'perm_identity'},
        {id: 'chat', name: 'Chat', icon: 'chat_bubble_outline'},
      ],
      layerEditorOpened: false,
      layerId: null,
      layerSelected: null,
      layerEditing: null,
      layersSelected: []
    }
  },
  computed: {
    videoHeight () {
      // if (this.$q.screen.xs) return this.$q.screen.height * 0.4
      // else {
      //   if (this.$store.state.ui.appFullscreen) return this.$q.screen.height - 53
      //   else return this.$q.screen.height * 0.4
      // }
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
      // 'calc(50% - '+footerWidth/2+'px)'
      if (this.$q.screen.width > 600) return `calc(50% - ${this.footerWidth / 2}px)`
      else return `calc(50% - ${this.footerWidth / 2}px)`
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
        layerEditorOpened: false,
        layerId: this.layerId,
        layerSelected: this.layerSelected,
        layerEditing: this.layerEditing,
        layersSelected: this.layersSelected,
        set: (key, val) => {
          this[key] = val
        }
      }
    }
  },
  async mounted () {
    this.$log('mounted')
    // this.$store.commit('ui/stateSet', ['appFullscreen', true])
    this.contentKalpa = await this.$rxdb.get(RxCollectionEnum.OBJ, this.content.contentOid)
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    this.$store.commit('ui/stateSet', ['appFullscreen', false])
  }
}
</script>
