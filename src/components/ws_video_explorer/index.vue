<template lang="pug">
q-layout(view="hHh Lpr lff")
  q-header(reveal)
    .row.full-width.justify-center.b-30
      div(
        :style=`{maxWidth: '800px', height: '50px', overflow: 'hidden'}`
        ).row.full-width.items-center.content-center.q-px-md.b-30
        span(:style=`{fontSize: '18px', whiteSpace: 'nowrap'}`).text-white.text-bold {{ contentWorkspaceName }}
  q-page-container
    q-page
      .row.full-width.items-start.content-start.justify-center
        div(:style=`{maxWidth: '800px'}`).row.full-width.items-start.content-start
          //- content wrapper
          div(
            :style=`{position: 'relative'}`
            v-observe-visibility=`{
              callback: contentVisibilityCallback,
              intersection: {
                threshold: 0.8
              }
            }`
            ).row.full-width.items-start.content-start
            q-resize-observer(@resize="contentHeight = $event.height")
            img(
              :src="contentKalpa.thumbUrl" draggable="false"
              :style=`{borderRadius: '10px', overflow: 'hidden'}`).full-width
            component(
              :is="playerComponent[contentKalpa.contentSource]"
              ref="contentPlayer" :url="contentKalpa.url" @player="player = $event"
              :style=`{
                position: 'absolute', top: '0px',
                borderRadius: '10px', overflow: 'hidden',}`).fit
            //- bar
            div(:style=`{position: 'absolute', zIndex: 1000, bottom: '0px',}`).row.full-width.justify-center
              content-bar(
                v-if="$refs.contentPlayer"
                :contentPlayer="$refs.contentPlayer"
                :bars="bars"
                :style=`{
                  maxWidth: '600px',
                }`)
                template(v-slot:header)
                  .row.full-width.q-py-xs
                    q-btn(round flat dense color="white" icon="play_arrow").b-50
                    .col
                    q-btn(
                      @click="nodeAdd()"
                      round color="green" dense icon="add"
                      :style=`{}`)
          //- page wrapper
          .row.full-width.items-start.content-start
            component(
              :is="`page-${pageId}`"
              :mode="mode" :contentWorkspace="contentWorkspace" :contentKalpa="contentKalpa"
              :pageHeight="pageHeight"
              @setCurrentTime="$refs.scrollWrapper.scrollTop = 0, $refs.contentPlayer.player.setCurrentTime($event)"
              @bars="bars = $event")
      //- footer: page control
      q-page-sticky(expand position="bottom")
        .row.full-width.justify-center.b-30
          div(:style=`{maxWidth: '800px', height: '50px',}`
            ).row.full-width.items-center.content-center.b-30
            q-btn(
              @click="$emit('back')"
              round flat color="white" icon="keyboard_arrow_left").q-ml-xs
            .col.full-height
              q-tabs(v-model="pageId" no-caps active-color="white").fit.text-grey-6
                q-tab(name="details" label="Details")
                q-tab(name="drafts" label="Drafts")
                q-tab(name="nodes" label="Nodes")
</template>

<script>
// api
import { RxCollectionEnum } from 'src/system/rxdb'
import { NodeApi } from 'src/api/node'
// players
import playerYoutube from './player_youtube/index.vue'
import playerKalpa from './player_kalpa/index.vue'
// pages
import pageDetails from './page_details/index.vue'
import pageDrafts from './page_drafts/index.vue'
import pageNodes from './page_nodes/index.vue'
// content
import contentBar from './content_bar/index.vue'

export default {
  name: 'wsVideoExplorer',
  components: {playerYoutube, playerKalpa, pageDetails, pageDrafts, pageNodes, contentBar},
  props: ['contentKalpa', 'contentWorkspace'],
  data () {
    return {
      pageId: 'drafts',
      contentHeight: 0,
      player: null,
      playerComponent: {
        YOUTUBE: 'player-youtube',
        KALPA: 'player-kalpa',
      },
      bars: [],
    }
  },
  computed: {
    contentWorkspaceName () {
      return this.contentWorkspace.name.slice(0, 100)
    },
    pageHeight () {
      return this.$q.screen.height - 50 - 50 - this.contentHeight
    }
  },
  methods: {
    contentVisibilityCallback (isVisible, entry) {
      // this.$log('contentVisibilityCallback', isVisible, entry)
      if (isVisible) {
        this.$refs.contentPlayer.play()
      }
      else {
        this.$refs.contentPlayer.pause()
      }
    },
    async nodeAdd () {
      this.$log('nodeAdd')
      // take current second and create node...
      let t = this.$refs.contentPlayer.currentTime
      // TODO: start/end for TTT
      let nodeInput = {
        name: '',
        spheres: [],
        category: 'FUN',
        layout: 'PIP',
        stage: 'draft',
        wsItemType: 'WS_NODE',
        contentOid: this.contentKalpa.oid,
        items: [
          {
            // composition: {
            //   layers: [
            //     {figuresAbsolute: [{t: t}, {t: t + 10}]}
            //   ],
            //   operation: { items: null, operations: null, type: 'CONCAT'},
            //   spheres: []
            // },
            contentOid: this.contentKalpa.oid,
            layers: [
              {contentOid: this.contentKalpa.oid, figuresAbsolute: [{t: t}, {t: t + 10}]},
            ],
            operation: { items: null, operations: null, type: 'CONCAT'},
            spheres: []
          }
        ]
      }
      let node = await this.$rxdb.set(RxCollectionEnum.WS_NODE, nodeInput)
      this.$log('node', node)
    }
  },
  mounted () {
    this.$log('mounted')
  }
}
</script>
