<template lang="pug">
div(
  :style=`{
    height: $q.screen.height+'px'
  }`
  ).row.full-width.justify-center
  //- maxWidth: $store.state.ui.maxWidthPage+'px',
  div(
    :style=`{
      position: 'relative',
    }`
    ).row.fit
    div(
      :style=`{
        position: 'relative',
      }`
      ).column.fit
      //- node editor (layer editor)
      transition(enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
        div(
          v-if="nodeEditorOpened"
          :style=`{
            position: 'absolute', zIndex: 10000,
            bottom: '66px',
            left: 'calc(50% - 400px)',
            height: '300px',
            width: '800px',
            borderRadius: '10px',
            overflow: 'hidden',
            opacity: 0.9
          }`
          ).row.b-50
          node-editor(:stateExplorer="stateExplorer")
      //- left panel
      div(
        :style=`{
          position: 'absolute', zIndex: 10000,
          left: '16px', top: '16px',
          width: '54px',
          maxWidth: '54px',
          height: 'calc(100% - 170px)',
          borderRadius: '10px',
          overflow: 'hidden',
          background: 'rgba(50,50,50,0.9)'
        }`
        ).row.items-start.content-start
        .row.full-width.justify-center.q-py-sm
          q-btn(round flat dense color="white" icon="blur_on")
      //- right panel
      div(
        :style=`{
          position: 'absolute', zIndex: 10000,
          right: '16px', top: '16px',
          width: '500px',
          maxWidth: rightPanelMaxWidth+'px',
          height: 'calc(100% - 170px)',
          borderRadius: '10px',
          overflow: 'hidden',
          background: 'rgba(50,50,50,0.9)',
        }`
        ).row
        div(:style=`{width: '46px'}`).row.full-height.items-start.content-start.justify-center.q-pl-sm.q-py-sm
          q-btn(
            @click="rightPanelOpened = !rightPanelOpened"
            round flat dense color="white"
            :icon="rightPanelOpened ? 'keyboard_arrow_right' : 'menu'"
          )
          q-btn(
            v-for="(p,pi) in pages" :key="p.id"
            @click="pageId = p.id, rightPanelOpened = true"
            round flat dense
            :color="p.id === pageId ? 'green' : 'white'"
            :icon="p.icon").full-width
        .col.full-height
          content-layers(
            v-if="pageId === 'layers'"
            @add="layerAdd()"
            :stateExplorer="stateExplorer")
          content-nodes(
            v-if="pageId === 'nodes'"
            :stateExplorer="stateExplorer")
      div(
        v-if="false"
        :style=`{
          position: 'absolute', zIndex: 10000,
          left: '16px', top: '16px',
          width: '240px',
          height: 'calc(100% - 170px)',
          borderRadius: '10px',
          overflow: 'hidden',
          opacity: 0.95
        }`
        ).row.b-50
        kalpa-menu
      div(
        :style=`{
          position: 'absolute', zIndex: 10000,
          left: 'calc(50% - 350px)',
          maxWidth: '700px',
          bottom: '0px',
        }`
        ).row.full-width.justify-center
        .row.full-width.justify-center.q-mb-sm
          q-btn(
            round push color="green" icon="blur_on"
            size="lg"
            :style=`{
              borderRadius: '50%',
            }`)
        content-progress(
          :stateExplorer="stateExplorer"
          :style=`{
          }`)
      //- header
      div(
        v-if="false && $q.screen.gt.xs"
        :style=`{
          position: 'relative',
          borderRadius: '0 0 10px 10px',
          overflow: 'hidden',
        }`
        ).row.full-width.items-center.content-center.q-py-md.q-px-sm.b-50
        q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$router.back()").q-mr-sm
        span(:style=`{fontSize: '16px'}`).text-white.text-bold {{ contentName }}
      .col.full-width
        content-player(
          @add="layerAdd"
          :stateExplorer="stateExplorer")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import contentPlayer from './content_player'
import contentProgress from './content_progress'
import contentLayers from './content_layers'
import contentNodes from './content_nodes'
import nodeEditor from './node_editor'

export default {
  name: 'wsContentExplorer',
  components: {contentPlayer, contentProgress, contentLayers, contentNodes, nodeEditor},
  props: ['content'],
  data () {
    return {
      height: 0,
      opened: true,
      player: null,
      duration: 0,
      currentTime: 0,
      loadeddata: false,
      playing: false,
      nodeEditorOpened: false,
      contentWs: null,
      layerId: null,
      pageId: 'layers',
      pages: [
        {id: 'settings', name: 'Settings', icon: 'tune'},
        {id: 'layers', name: 'Layers', icon: 'layers'},
        {id: 'nodes', name: 'Nodes', icon: 'hdr_strong'},
        {id: 'spheres', name: 'Spheres', icon: 'blur_on'},
        {id: 'people', name: 'People', icon: 'perm_identity'},
        {id: 'chat', name: 'Chat', icon: 'chat_bubble_outline'},
      ],
      rightPanelOpened: false,
      rightPanelMaxWidth: 54
    }
  },
  computed: {
    stateExplorer () {
      return {
        player: this.player,
        duration: this.duration,
        currentTime: this.currentTime,
        loadeddata: this.loadeddata,
        content: this.content,
        playing: this.playing,
        nodeEditorOpened: this.nodeEditorOpened,
        height: this.height,
        contentWs: this.contentWs,
        layerId: this.layerId,
        layer: this.contentWs?.layers.find(l => l.id === this.layerId),
        set: (key, val) => {
          this[key] = val
        }
      }
    },
    contentName () {
      return this.content.name
    }
  },
  watch: {
    rightPanelOpened: {
      handler (to, from) {
        this.$log('rightPanelOpened CHANGED', to)
        this.$tween.to(this, 0.3, {rightPanelMaxWidth: to ? 500 : 54})
      }
    }
  },
  methods: {
    layerAdd (layerInput) {
      this.$log('layerAdd start', layerInput)
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
      this.stateExplorer.set('layerId', layerId)
      this.stateExplorer.set('nodeEditorOpened', true)
    },
    async contentAdd (content) {
      this.$log('contentAdd content', content)
      // todo неверное решение! мастерская автономна! oid появится только после синхронизации!!!!
      let {items: contentFind} = await this.$rxdb.find({
        selector: {
          rxCollectionEnum: RxCollectionEnum.WS_CONTENT,
          contentOid: content.oid
        }
      })
      this.$log('contentAdd contentFind', contentFind)
      // create rxDoc
      if (contentFind.length === 0) {
        let contentInput = {
          wsItemType: 'WS_CONTENT',
          thumbOid: content.thumbUrl,
          name: content.name,
          layers: [],
          spheres: [],
          contentOid: content.oid,
          contentType: content.type,
          operation: {
            items: null,
            operations: null,
            type: 'CONCAT'
          }
        }
        this.$log('contentAdd contentInput', contentInput)
        let res = await this.$rxdb.set(RxCollectionEnum.WS_CONTENT, contentInput)
        this.$log('contentAdd res', res)
        return res
      } else {
        return contentFind[0]
      }
    },
  },
  async mounted () {
    this.$log('mounted')
    this.contentWs = await this.contentAdd(this.content)
    this.$log('contentWs', this.contentWs)
  }
}
</script>
