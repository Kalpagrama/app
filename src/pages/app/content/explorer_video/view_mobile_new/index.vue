<template lang="pug">
q-layout(
  view="hHh Lpr lff")
  q-header.b-30
    .row.full-width.justify-center
      div(
        :style=`{
          position: 'relative',
          maxWidth: $store.state.ui.pageWidth+'px',
          paddingTop: (node && node.items[1]) ? '16px' : '8px',
        }`
        ).row.full-width
        //- items wrapper
        div(:style=`{zIndex: 100}`).row.full-width
          //- first item
          .col
            div(
              :style=`{
                position: 'relative',
                paddingBottom: (node && node.items[1]) ? '100%' : '50%',
                transform: (node && node.items[1]) ? 'perspective(600px) rotateY(8deg)' : 'none',
              }`
              ).row.full-width
              item-editor(
                @stop="nodeIsActive = false"
                @item="$event => itemFound($event, 0)"
                :item="node ? node.items[0] : contentKalpa"
                :isActive="nodeIsActive"
                :styles=`{
                  height: '100%',
                }`
                :style=`{
                  position: 'absolute', zIndex: 200,
                  height: '100%',
                }`)
                template(v-slot:footer v-if="node && !node.items[1]")
                  node-editor(
                    v-if="node"
                    :node="node"
                    :style=`{
                      zIndex: 110,
                    }`
                    @active="nodeIsActive = $event"
                    @close="node = null")
          //- second item
          div(
            v-if="node && node.items[1]"
            ).col
            div(
              :style=`{
                position: 'relative',
                paddingBottom: '100%',
                transform: 'perspective(600px) rotateY(-8deg)'
              }`
              ).row.full-width
              item-editor(
                @item="$event => itemFound($event, 1)"
                :item="node.items[1]"
                :isActive="nodeIsActive"
                :styles=`{
                  height: '100%',
                }`
                :style=`{
                  position: 'absolute', zIndex: 100,
                  height: '100%',
                }`)
        node-editor(
          v-if="node && node.items[1]"
          :node="node"
          :style=`{
            zIndex: 50,
          }`
          @active="nodeIsActive = $event"
          @close="node = null")
  q-page-container
    page-nodes(
      v-if="!node"
      :nodeQuery="(query && query.node) ? query.node : false"
      :player="player"
      :contentKalpa="contentKalpa")
      page-details(
        :contentKalpa="contentKalpa").q-mb-sm
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import pageNodes from './page_nodes/index.vue'
import pageDetails from './page_details/index'

export default {
  name: 'contentExplorerVideo',
  components: {
    pageNodes,
    pageDetails,
    itemEditor: () => import('./node_editor/item_editor.vue'),
    nodeEditor: () => import('./node_editor/index.vue'),
  },
  props: ['contentKalpa', 'query'],
  data () {
    return {
      pageId: 'nodes',
      player: null,
      node: null,
      nodeIsActive: true,
      figures: [],
      frames: [],
      headerHeight: 0,
    }
  },
  watch: {
    // query: {
    //   immediate: true,
    //   async handler (to, from) {
    //     if (to && to.node) {
    //       // alert(to.node)
    //     }
    //   }
    // }
  },
  methods: {
    itemFound (item, itemIndex) {
      this.$log('itemFound', item, itemIndex)
      if (!this.node) {
        this.node = {
          name: '',
          spheres: [],
          layout: 'VERTICAL',
          thumbUrl: '',
          items: [],
          category: 'FUN',
          vertices: [],
        }
      }
      // this.node.items[itemIndex] = item
      this.$set(this.node.items, itemIndex, item)
    },
    // async nodeCreate () {
    //   this.$log('nodeCreate')
    //   // this.player.fullscreenToggle(false)
    //   // start/end
    //   let start = this.player.currentTime
    //   let end = start + 30 > this.player.duration ? this.player.duration : start + 30
    //   let nodeInput = {
    //     name: '',
    //     spheres: [],
    //     category: 'FUN',
    //     layout: 'VERTICAL',
    //     thumbUrl: this.contentKalpa.thumbUrl,
    //     items: [
    //       {
    //         id: Date.now().toString(),
    //         thumbUrl: this.contentKalpa.thumbUrl,
    //         outputType: 'VIDEO',
    //         layers: [
    //           {id: Date.now().toString(), contentOid: this.contentKalpa.oid, figuresAbsolute: [{t: start, points: []}, {t: end, points: []}]},
    //         ],
    //         operation: { items: null, operations: null, type: 'CONCAT'},
    //       }
    //     ]
    //   }
    //   // let node = await this.$rxdb.set(RxCollectionEnum.WS_NODE, nodeInput)
    //   let node = nodeInput
    //   this.$log('nodeCreate node', node)
    //   return node
    // },
    // playerErrorHandle () {
    //   this.$log('playerErrorHandle')
    //   confirm('Player error! Try on desktop!')
    // },
    // playerLoaded (player) {
    //   this.$log('playerLoaded', player)
    //   this.player = player
    //   let startat = this.query.startat
    //   this.$log('startat', startat)
    //   if (startat) {
    //     this.player.setCurrentTime(startat)
    //   }
    // }
  }
}
</script>
