<template lang="pug">
div(:style=`{position: 'relative'}`).column.fit.b-30
  //- body
  div(ref="scrollWrapper").col.full-width.scroll
    .row.full-width.justify-center
      div(:style=`{maxWidth: '800px',}`).row.full-width.items-start.content-start
        div(:style=`{height: '50px',}`).row.full-width.items-center.content-center.q-px-md.b-30
          span(:style=`{fontSize: '18px',}`).text-white.text-bold {{ contentWorkspaceName }}
          //- span.text-white {{ contentHeight }}
        div(
          :style=`{position: 'relative'}`
          v-observe-visibility=`{
            callback: contentVisibilityCallback,
            intersection: {
              threshold: 0.8
            }
          }`
          ).row.full-width
          q-resize-observer(@resize="contentHeight = $event.height")
          img(
            :src="contentKalpa.thumbUrl" draggable="false"
            :style=`{borderRadius: '10px', overflow: 'hidden'}`).full-width
          content-player(
            ref="contentPlayer" :url="contentKalpa.url" @player="player = $event"
            :style=`{
              position: 'absolute', top: '0px',
              borderRadius: '10px', overflow: 'hidden',}`).fit
          div(:style=`{position: 'absolute', zIndex: 1000, bottom: '0px',}`).row.full-width.justify-center
            content-bar(
              v-if="$refs.contentPlayer"
              :contentPlayer="$refs.contentPlayer"
              :bars="bars"
              :style=`{
                //- position: 'absolute', zIndex: 1000, bottom: '0px',
                //- left: '50%', marginRight: '-50%', transform: 'translate(-50%, 0)',
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
          //- div(:style=`{position: 'relative',}`).row.full-width
        //- div(v-if="$refs.contentPlayer").row.full-width.q-pa-sm
          q-btn(no-caps color="red" @click="$refs.contentPlayer.pause()") Pause
          q-btn(no-caps color="green" @click="$refs.contentPlayer.play()") Play
          span.text-white {{ $refs.contentPlayer.currentTime }}
        .row.full-width.items-start.content-start
          component(
            :is="`page-${pageId}`"
            :mode="mode" :contentWorkspace="contentWorkspace" :contentKalpa="contentKalpa"
            :pageHeight="pageHeight"
            @setCurrentTime="$refs.scrollWrapper.scrollTop = 0, $refs.contentPlayer.player.setCurrentTime($event)"
            @bars="bars = $event")
  //- footer
  .row.full-width.justify-center
    div(:style=`{maxWidth: '800px', height: '50px',}`
      ).row.full-width.items-center.content-center.b-30
      q-btn(
        @click="$emit('close')"
        round flat color="white" icon="keyboard_arrow_left").q-ml-xs
      .col.full-height
        q-tabs(v-model="pageId" no-caps active-color="white").fit.text-grey-6
          q-tab(name="details" label="Details")
          q-tab(name="drafts" label="Drafts")
          q-tab(name="nodes" label="Nodes")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import { NodeApi } from 'src/api/node'

import contentPlayer from './content_player/index.vue'
import contentBar from './content_bar/index.vue'
import pageDetails from './page_details/index.vue'
import pageDrafts from './page_drafts/index.vue'
import pageNodes from './page_nodes/index.vue'

export default {
  name: 'wsContentExplorer_youtubeExplorer',
  components: {contentPlayer, contentBar, pageDetails, pageDrafts, pageNodes},
  props: ['mode', 'contentWorkspace', 'contentKalpa'],
  data () {
    return {
      pageId: 'drafts',
      contentHeight: 0,
      player: null,
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
            //     {figuresAbsolute: [{t: t}]}
            //   ],
            //   operation: { items: null, operations: null, type: 'CONCAT'},
            //   spheres: []
            // },
            contentOid: this.contentKalpa.oid,
            layers: [
              {contentOid: this.contentKalpa.oid, figuresAbsolute: [{t: t}]}
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
