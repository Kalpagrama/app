<template lang="pug">
div(
  :style=`{
    position: 'relative',
    height: $q.screen.height+'px',
  }`
  ).column.full-width.bg-black
  img(
    @load="contentKalpaThumbUrlLoaded"
    :src="contentKalpa.thumbUrl"
    :style=`{
      position: 'absolute', zIndex: 100, top: '0px',
      opacity: 0,
      pointerEvents: 'none',
    }`
    ).full-width
  content-player(
    :contentKalpa="contentKalpa"
    :options=`{
      showPult: $q.screen.gt.sm ? true : !pageId,
      showTint: $q.screen.gt.sm ? true : !pageId,
    }`
    @player="playerReady"
    ).fit.bg-black
    template(v-slot:pult)
      div(
        v-if="player && $q.screen.gt.sm"
        :style=`{height: 'auto', maxHeight: 500+'px',}`).row.full-width
        component(
          :is="`page-${pageId}`"
          :contentKalpa="contentKalpa"
          :player="player"
          :node="node"
          @node="node = $event, pageId = 'node'"
          @pageId="pageId = $event"
          @close="pageId = null")
        page-node-editor(
          v-if="player.figures"
          :contentKalpa="contentKalpa"
          :player="player"
          :style=`{
            borderRadius: '10px',
            overflow: 'hidden',
          }`
          @node="node = $event, pageId = 'node'").b-30
    template(v-slot:footer)
      div(
        v-if="player && $q.screen.lt.md"
        :style=`{height: $q.screen.height-44-contentHeight+'px',}`).row.full-width
        component(
          :is="`page-${pageId}`"
          :contentKalpa="contentKalpa"
          :player="player"
          :node="node"
          @node="node = $event, pageId = 'node'"
          @pageId="pageId = $event"
          @close="pageId = null")
      div(
        v-if="player"
        :style=`{position: 'relative'}`).row.full-width
        div(
          v-if="player.figures && $q.screen.lt.md"
          :style=`{position: 'absolute', zIndex: 100, bottom: '0px'}`).row.fit.bg-black.q-px-md
          q-btn(
            v-if="pageId !== 'node-editor'"
            flat color="green" no-caps
            :style=`{
              height: '44px',
            }`
            @click="pageId = 'node-editor'"
            ).full-width
            span {{$t('Edit node')}}
          q-btn(
            v-if="pageId === 'node-editor'"
            flat color="green" no-caps
            :style=`{
              height: '44px',
            }`
            @click="pageId = null"
            ).full-width
            span {{$t('Edit fragment')}}
        nav-bottom(
          :pageId="pageId" @pageId="pageId === $event ? pageId = null : pageId = $event")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import contentPlayer from 'components/content_player/index.vue'

import navBottom from '../nav_bottom.vue'
import pageNodes from './page_nodes/index.vue'
import pageNode from './page_node/index.vue'
import pageNodeEditor from './page_node_editor/index.vue'
import pageDrafts from '../page_drafts/index.vue'
import pageInfo from '../page_info_root/index.vue'

import nodeCreator from '../node_creator/index.vue'

export default {
  name: 'layoutVideo',
  props: ['contentKalpa'],
  components: {
    contentPlayer,
    pageNodes,
    pageNode,
    pageNodeEditor,
    pageDrafts,
    pageInfo,
    navBottom,
    nodeCreator,
  },
  data () {
    return {
      player: null,
      pageId: null,
      contentHeight: 0,
      contentHeightMin: 0,
      node: null,
    }
  },
  computed: {
    // contentHeightMin () {
    //   // if (this.$q.screen.width < 800)
    //   let width = this.contentKalpa.thumbWidth
    //   let height = this.contentKalpa.thumbHeight
    //   // return this.$q.screen.height - (this.$q.screen.width * width) / height
    //   let res = (height * this.$q.screen.width) / width
    //   return res
    //   // return Math.min(this.$q.screen.height / 2, res)
    // },
    queryClusters () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_ITEMS,
          objectTypeEnum: { $in: ['NODE', 'JOINT'] },
          // objectTypeEnum: { $in: ['NODE'] },
          oidSphere: this.contentKalpa.oid,
          sortStrategy: 'AGE',
          groupByContentLocation: true
        },
        populateObjects: false,
      }
      return res
    }
  },
  watch: {
    pageId: {
      handler (to, from) {
        if (to) {
          this.$tween.to(this, 0.3, {contentHeight: this.contentHeightMin})
        }
        else {
          this.$tween.to(this, 0.3, {contentHeight: this.$q.screen.height})
        }
      }
    },
    'player.figures': {
      deep: true,
      immediate: true,
      handler (to, from) {
        this.$log('player.figures TO', to)
        // if (to && !from) {
        //   this.pageId = 'node-editor'
        // }
      }
    }
    // 'player.playingCount': {
    //   async handler (to, from) {
    //     if (to === 1) {
    //       await this.nodePlay()
    //     }
    //   }
    // },
  },
  methods: {
    contentKalpaThumbUrlLoaded (e) {
      this.$log('contentKalpaThumbUrlLoaded', e.target.clientHeight)
      this.contentHeightMin = e.target.clientHeight
    },
    async playerReady (player) {
      this.$log('playerReady')
      // this.player = player
      this.$set(this, 'player', player)
      // Handle player.autoplay
      this.$nextTick(() => {
        this.player.play()
      })
      // Get player clusters
      this.clustersRes = await this.$rxdb.find(this.queryClusters, true)
      this.$log('clustersRes', this.clustersRes)
      this.player.setState('clusters', this.clustersRes.items)
    },
    async nodePlay () {
      this.$log('nodePlay')
      let nodeOid = this.$store.state.ui.nodeOnContent
      if (nodeOid) {
        // get node
        this.$log('playerReady: nodeOid found, getting node...')
        let node = await this.$rxdb.get(RxCollectionEnum.OBJ, nodeOid)
        this.$log('playerReady: node found, show node in video...', node)
        if (node.items[0] && node.items[0].layers) {
          this.player.setCurrentTime(node.items[0].layers[0].figuresAbsolute[0].t)
          this.player.play()
          this.player.setState('nodePlaying', node)
        }
      }
    }
  },
  async mounted () {
    this.$log('mounted')
    this.contentHeight = this.$q.screen.height
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    this.player.setState('nodePlaying', null)
    this.$store.commit('ui/stateSet', ['nodeOnContent', null])
  }
}
</script>
