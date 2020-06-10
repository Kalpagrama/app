<template lang="pug">
div(
  v-if="contentKalpa"
  :style=`{position: 'relative'}`).column.fit
  //- right panel
  div(
    v-if="false"
    :style=`{
      position: 'absolute', zIndex: 99999,
      top: $store.state.ui.appFullscreen ? '8px' : '0px',
      right: $store.state.ui.appFullscreen ? '8px' : -$store.state.ui.panelMaxWidth+'px',
      height: $q.screen.height-120+'px'
    }`).row
    content-meta(:stateExplorer="stateExplorer")
  //- body
  content-player(
    :stateExplorer="stateExplorer")
  //- footer fixed
  div(
    :style=`{
      position: 'fixed', zIndex: 10000,
      bottom: '0px',
      maxWidth: footerWidth+'px',
      left: footerLeft,
    }`
    ).row.full-width
    transition(enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
      layer-editor(
        v-if="layerEditorOpened"
        @close="layerEditorOpened = false"
        )
    div(v-if="false").row.full-width.justify-center.q-pb-sm
      q-btn(
        v-if="!layerEditorOpened"
        @click="stateExplorer.set('layerEditorOpened', true)"
        round push color="green" icon="blur_on" size="lg"
        :style=`{borderRadius: '50%'}`)
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
    }
  },
  computed: {
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
        // layer: this.contentWs?.layers.find(l => l.id === this.layerId),
        set: (key, val) => {
          this[key] = val
        }
      }
    }
  },
  async mounted () {
    this.$log('mounted')
    this.$store.commit('ui/stateSet', ['appFullscreen', true])
    this.contentKalpa = await this.$rxdb.get(RxCollectionEnum.OBJ, this.content.contentOid)
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    this.$store.commit('ui/stateSet', ['appFullscreen', false])
  }
}
</script>
