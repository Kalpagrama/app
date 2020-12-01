<template lang="pug">
q-layout(
  view="hHh Lpr lff")
  q-header(
    :class=`{
      'q-px-md': false
    }`
    :style=`{
      background: 'none !important',
    }`)
    //- .row.full-width.justify-center
      span.text-green Связь
    .row.full-width.justify-center
      div(
        :style=`{
          position: 'relative',
          maxWidth: '700px',
          borderRadius: '10px',
          //- borderTop: '2px solid #4caf4f',
          //- borderLeft: '2px solid #4caf4f',
          //- borderRight: '2px solid #4caf4f',
        }`).row.full-width.bg-black
        //- q-resize-observer(@resize="onResize")
        content-player(
          :contentKalpa="contentKalpa"
          @player="playerLoaded"
          @error="playerErrorHandle"
          :style=`{
            borderRadius: '10px',
            //- overflow: 'hidden',
          }`).fit
          template(v-slot:bar)
            div(
              v-if="player && figures.length > 0"
              :style=`{
                position: 'absolute', zIndex: 2050, pointerEvents: 'none',
                //- borderRadius: '10px', overflow: 'hidden',
              }`
              ).row.fit
              template(v-for="(f,fi) in figures")
                div(
                  v-if="f.length === 1"
                  :key="fi"
                  :style=`{
                    position: 'absolute', zIndex: 2050, top: '0px',
                    left: f[0].t/player.duration*100+'%',
                    width: '2px',
                    background: 'rgba(255,255,255, 0.5)',
                  }`
                  ).row.full-height
                div(
                  v-if="f.length === 2"
                  :key="fi"
                  :style=`{
                    position: 'absolute', zIndex: 2050, top: '-2px',
                    left: f[0].t/player.duration*100+'%',
                    width: (f[1].t-f[0].t)/player.duration*100+'%',
                    height: 'calc(100% + 4px)',
                    border: '2px solid rgb(76,175,80)',
                    borderRadius: '4px',
                    background: 'rgba(255,255,255,0.2)',
                    pointerEvents: 'none',
                  }`
                  ).row
        //- div(v-if="pageId !== 'node'").row.full-width.q-pb-sm.bg-black
        q-btn(
          v-if="player && pageId !== 'node'"
          @click="nodeCreateStart()"
          round flat color="green" icon="add" dense
          :style=`{
            position: 'absolute', zIndex: 2000, right: '8px', bottom: '4px',
          }`)
          //- template(v-slot:bar-current-time=`{panning}`)
            transition(enter-active-class="animated fadeIn" leave-active-class="none")
              q-btn(
                v-if="player && !panning && pageId !== 'node'"
                @click="nodeCreateStart()"
                round color="green" icon="add" dense
                :style=`{
                  position: 'absolute', zIndex: 1000, top: '-44px', borderRadius: '50%',
                  left: 'calc('+(player.currentTime/player.duration)*100+'% - 17px)',
                }`)
        //- content.name like node.name
        //- .row.full-width.justify-center.q-pa-xs.bg-red
          span.text-white.text-bold {{ contentKalpa.name }}
  q-page-container
    q-page-sticky(
      v-if="pageId !== 'node'"
      expand position="bottom"
      :class=`{
        'b-30': pageId !== 'joints',
        'bg-black': pageId === 'joints'
      }`
      :style=`{zIndex: 1000, borderRadius: '10px 10px 0 0',}`
      ).full-width
      div(
        :style=`{}`).row.full-width.justify-center
        div(:style=`{maxWidth: 700+'px'}`).row.full-width
          q-btn(
            round flat color="grey-8" icon="keyboard_arrow_left" @click="$router.back()" no-caps
            :style=`{
              marginBottom: '1px',
            }`
            ).q-px-sm.q-mx-md Назад
          .col
            q-tabs(
              v-model="pageId"
              align="justify"
              no-caps active-color="green").full-width.text-grey-8
              q-tab(v-for="p in pages" :key="p.id" :name="p.id" :label="p.name")
    component(
      v-if="player && contentKalpa"
      :is="`page-${pageId}`"
      :contentKalpa="contentKalpa" :node="node"
      :player="player"
      :headerHeight="headerHeight"
      :class=`{
        'b-30': pageId !== 'joints',
        'bg-black': pageId === 'joints'
      }`
      @frames="frames = $event"
      @figures="figures = $event"
      @close="pageId = 'nodes'")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import contentPlayer from 'components/content_player/index.vue'

import pageNodes from './page_nodes/index.vue'
import pageDetails from './page_details/index'
import pageNode from './page_node/index.vue'
import pageJoints from './page_joints/index.vue'

export default {
  name: 'contentExplorerVideo',
  components: {contentPlayer, pageNodes, pageDetails, pageNode, pageJoints},
  props: ['contentKalpa', 'query'],
  data () {
    return {
      pageId: 'nodes',
      player: null,
      node: null,
      figures: [],
      frames: [],
      headerHeight: 0,
    }
  },
  computed: {
    pages () {
      return [
        {id: 'details', icon: 'info', name: 'Детали'},
        {id: 'nodes', icon: 'filter_tilt_shift', name: 'Ядра'},
        // {id: 'joints', icon: 'link', name: 'Связи'},
        // {id: 'similar', icon: 'menu', name: 'Similar'}
      ]
    }
  },
  watch: {
    query: {
      immediate: true,
      async handler (to, from) {
        this.$log('query TO', to)
        // if (to) {}
        // set viewId force, from feed or from workspace
        // if (to && to.pageId) {
        //   this.pageId = to.pageId
        // }
        // if (to.oid) {}
      }
    }
  },
  methods: {
    onResize (e) {
      this.$log('onResize', e)
      // this.headerHeight = e.height
    },
    async nodeCreateStart () {
      this.$log('nodeCreateStart')
      // create something link or node... or always node...
      let node = await this.nodeCreate()
      this.node = node
      this.pageId = 'node'
    },
    async nodeCreate () {
      this.$log('nodeCreate')
      // this.player.fullscreenToggle(false)
      // start/end
      let start = this.player.currentTime
      let end = start + 30 > this.player.duration ? this.player.duration : start + 30
      let nodeInput = {
        name: '',
        spheres: [],
        category: 'FUN',
        layout: 'VERTICAL',
        thumbUrl: this.contentKalpa.thumbUrl,
        items: [
          {
            id: Date.now().toString(),
            thumbUrl: this.contentKalpa.thumbUrl,
            outputType: 'VIDEO',
            layers: [
              {id: Date.now().toString(), contentOid: this.contentKalpa.oid, figuresAbsolute: [{t: start, points: []}, {t: end, points: []}]},
            ],
            operation: { items: null, operations: null, type: 'CONCAT'},
          }
        ]
      }
      // let node = await this.$rxdb.set(RxCollectionEnum.WS_NODE, nodeInput)
      let node = nodeInput
      this.$log('nodeCreate node', node)
      return node
    },
    playerErrorHandle () {
      this.$log('playerErrorHandle')
      confirm('Player error! Try on desktop!')
    },
    playerLoaded (player) {
      this.$log('playerLoaded', player)
      this.player = player
      let startat = this.query.startat
      this.$log('startat', startat)
      if (startat) {
        this.player.setCurrentTime(startat)
      }
    }
  }
}
</script>
