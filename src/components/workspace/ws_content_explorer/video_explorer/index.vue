<template lang="pug">
div(
  v-if="contentKalpa"
  :style=`{position: 'relative'}`).column.fit
  //- right panel
  div(
    :style=`{
      position: 'absolute', zIndex: 99999, right: '-500px',
      width: '500px', height: $q.screen.height-120+'px',
    }`).row.q-pl-sm
    content-meta(:stateExplorer="stateExplorer")
  //- body
  content-player(
    :stateExplorer="stateExplorer")
  //- footer fixed
  div(
    :style=`{
      position: 'fixed', zIndex: 10000,
      bottom: '0px',
      maxWidth: '600px', left: 'calc(50% - 300px)',
    }`
    ).row.full-width
    .row.full-width.justify-center.q-pb-sm
      q-btn(
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
      pageId: 'layers',
      pages: [
        {id: 'layers', name: 'Layers', icon: 'layers'},
        {id: 'nodes', name: 'Nodes', icon: 'hdr_strong'},
        {id: 'spheres', name: 'Spheres', icon: 'blur_on'},
        {id: 'people', name: 'People', icon: 'perm_identity'},
        {id: 'chat', name: 'Chat', icon: 'chat_bubble_outline'},
      ]
    }
  },
  computed: {
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
        // nodeEditorOpened: this.nodeEditorOpened,
        // height: this.height,
        // layerId: this.layerId,
        // layer: this.contentWs?.layers.find(l => l.id === this.layerId),
        set: (key, val) => {
          this[key] = val
        }
      }
    }
  },
  async mounted () {
    this.$log('mounted')
    this.contentKalpa = await this.$rxdb.get(RxCollectionEnum.OBJ, this.content.contentOid)
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
