<template lang="pug">
div(
  :style=`{
    position: 'relative',
    height: $q.screen.height+'px',
  }`
  ).column.full-width.bg-black
  //- body
  .col.full-width
    div(
      :style=`{
        position: 'relative',
      }`
      ).row.fit.justify-center
      div(
        :style=`{
          position: 'relative',
          //- maxWidth: 650+'px',
          overflow: 'hidden',
        }`
        ).row.fit
        //- node editor mobile
        transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
          div(
            v-if="player && $q.screen.lt.lg"
            :style=`{
              position: 'absolute', zIndex: 10000, top: '0px',
            }`
            ).row.full-width.q-pa-sm
            node-creator(
              :player="player"
              :contentKalpa="contentKalpa")
        //- pages desktop
        transition(enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
          div(
            v-if="pageId && player"
            @click.self="pageId = null"
            :style=`{
              position: 'absolute', zIndex: 900, top: '0px',
            }`
            ).row.fit.items-end.content-end.justify-center
            div(
              :style=`{
                maxWidth: 650+'px',
                maxHeight: 'calc(100% - 60px)',
                background: 'rgba(30,30,30,0.95)',
                borderRadius: '8px',
              }`
              ).row.fit
              component(
                :is="`page-${pageId}`"
                :contentKalpa="contentKalpa"
                :player="player"
                :style=`{
                }`
                @close="pageId = null")
        //- player
        content-player(
          @player="playerReady"
          :contentKalpa="contentKalpa"
          :style=`{
            height: '100%',
            //- maxWidth: 600+'px',
          }`
          :options=`{
            showHeader: false,
            showBar: true,
            showFooter: true,
            mode: 'editor',
          }`
          :styles=`{
            height: '100%',
            objectFit: 'contain',
          }`
          ).full-width.bg-black
          template(v-slot:tint-bar=`{tintFocused}`)
            node-creator(
              v-if="player && !pageId && $q.screen.gt.md"
              :player="player"
              :contentKalpa="contentKalpa")
  //- footer
  nav-bottom(
    v-show="footerShow"
    :pageId="pageId" @pageId="pageId = $event")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import contentPlayer from 'components/content_player/index.vue'

import pageNodes from './page_nodes/index.vue'
import pageDrafts from '../page_drafts/index.vue'
import pageInfo from '../page_info_root/index.vue'
import navBottom from '../nav_bottom.vue'

import nodeCreator from '../node_creator/index.vue'

export default {
  name: 'layoutVideo',
  props: ['contentKalpa'],
  components: {
    contentPlayer,
    pageNodes,
    pageDrafts,
    pageInfo,
    navBottom,
    nodeCreator,
  },
  data () {
    return {
      player: null,
      pageId: null,
      footerShow: true,
    }
  },
  computed: {
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
    'player.playingCount': {
      async handler (to, from) {
        if (to === 1) {
          await this.nodePlay()
        }
      }
    },
    pageId: {
      handler (to, from) {
        if (to) {
          this.player.pause()
          // TODO: nodePlaying ?, figure?
        }
        else {
          this.player.play()
        }
      }
    },
  },
  methods: {
    async playerReady (player) {
      this.$log('playerReady')
      this.player = player
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
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    this.player.setState('nodePlaying', null)
    this.$store.commit('ui/stateSet', ['nodeOnContent', null])
  }
}
</script>
