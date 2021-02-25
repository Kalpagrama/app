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
        //- pages
        transition(enter-active-class="animated slideInLeft" leave-active-class="animated slideOutLeft")
          div(
            v-if="pageId && player && !player.figure"
            :style=`{
              position: 'absolute', top: '0px', left: '0px', zIndex: 900,
              background: 'rgba(30,30,30,0.98)',
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
        //- node creator
        div(
          v-if="player && player.figure && !pageId"
          :style=`{
            position: 'absolute', zIndex: 1000, bottom: '40px',
          }`
          ).row.full-width.q-pb-sm
          node-creator(
            :player="player"
            :contentKalpa="contentKalpa")
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
              :player="player"
              :contentKalpa="contentKalpa")
            //- .row.full-width.justify-center.q-py-sm
              div(
                :style=`{
                  maxWidth: 600+'px',
                  height: '100px',
                  borderRadius: '20px',
                  background: 'rgba(30,30,30,0.5)',
                }`
                ).row.full-width
                .row.full-width.items-center.content-center.justify-center.q-pa-md
                  span(:style=`{fontSize: '18px',}`).text-white.text-bold kas dlkasldk malksd malksm dalkm
                .row.full-width.justify-center.q-pa-sm
                  span(v-for="n in 5" :key="n").text-white.q-mr-sm #sphere {{ n }}
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
  },
  watch: {
    'player.playingCount': {
      async handler (to, from) {
        if (to === 1) {
          await this.nodePlay()
        }
      }
    }
  },
  methods: {
    async playerReady (player) {
      this.$log('playerReady')
      this.player = player
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
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
