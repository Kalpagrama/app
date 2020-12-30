<style lang="sass">
.q-footer
  background: none !important
</style>

<template lang="pug">
div(
  view="hHh Lpr lff"
  :style=`{
    minHeight: $q.screen.height+'px'
  }`).row.full-width.bg-black
  q-resize-observer(@resize="onResize" :debounce="300")
  div(
    v-if="showMenu"
    reveal
    :style=`{
      position: 'fixed', zIndex: 1000, bottom: '0px',
    }`).row.full-width
    .row.full-width.justify-center
      div(
        :style=`{
          height: headerHeight+'px',
          maxWidth: $store.state.ui.pageWidth+'px',
          //- maxWidth: '500px',
          borderRadius: '10px 10px 0 0',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }`
        ).row.full-width.items-start.content-start.b-40
        //- here?
        div(
          v-if="player && node"
          :style=`{
            //- height: $q.screen.height-heightSquare+'px',
          }`
          ).row.fit.items-between.content-between.b-30
          composition-editor(
            v-if="player && node"
            :player="player"
            :composition="node.items[0]"
            :contentKalpa="contentKalpa"
            :style=`{
            }`).bg-black
          name-editor(:node="node")
          spheres-editor(:node="node")
          div(:style=`{paddingLeft: '60px', paddingRight: '60px',}`).row.full-width.justify-center
            category-editor(:node="node" :style=`{}`)
          //- footer
          .row.full-width.justify-center
            div(
              :style=`{
                maxWidth: $store.state.ui.pageWidth+'px',
                borderRadius: '10px 10px 0 0',
              }`
              ).row.full-width.justify-between.b-40.q-px-sm.q-pb-xs.q-pt-sm
              q-btn(
                @click="node = null, headerHeight = 65"
                flat color="grey-7" icon="west" no-caps
                :style=`{maxWidth: '60px'}`)
                .row.full-width.justify-center
                  small Назад
              q-btn(
                @click="node = null, headerHeight = 65"
                flat color="green" icon="check" no-caps
                :style=`{maxWidth: '60px'}`)
                .row.full-width.justify-center
                  small Опубликовать
        //- navigation
        div(
          v-if="!node"
          ).column.fit
          div(v-if="pageId === 'nodes'").col.full-width.scroll
            page-nodes(
              v-if="pageId && pageId === 'nodes'"
              :contentKalpa="contentKalpa" :player="player")
          nav-mobile(
            v-if="!node"
            @toggle="pageId = null, showMenu = false"
            @pageId="pageIdChanged"
            :pageId="pageId")
  .row.full-width.justify-center
    div(
      :style=`{
        position: 'relative',
        //- paddingBottom: 'env(safe-area-inset-bottom)',
        maxWidth: player ? player.isFullscreen ? '100%' : $store.state.ui.pageWidth+'px' : $store.state.ui.pageWidth+'px',
        //- height: $q.screen.height-(showMenu ? 65+(node ? 310 : 0) : 0)+'px',
        //- height: node ? heightSquare+'px' : ($q.screen.height-65)+'px',
        height: (pageId || node) ? heightSquare+'px' : ($q.screen.height-65)+'px',
        //- maxWidth: '500px', maxHeight: '500px',
        //- paddingBottom: 0+0+'px',
      }`
      ).row.full-width.justify-center
      div(
        :style=`{
          position: 'relative',
        }`
        ).row.fit
        content-player(
          @player="player = $event"
          :contentKalpa="contentKalpa"
          :style=`{
            height: '100%',
          }`
          ).full-width.bg-black
        //- actions
        div(
          :style=`{
            position: 'absolute', zIndex: 3000, bottom: '0px',
          }`
          ).row.full-width.justify-center
          div(:style=`{position: 'relative', maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width
            q-btn(
              v-if="showMenu && !pageId"
              @click="essenceCreateStart()"
              round flat dense color="green" icon="add_circle_outline"
              :style=`{
                position: 'absolute', zIndex: 3000,
                right: '12px', top: '-44px'
              }`)
            q-btn(
              v-if="!showMenu && !pageId"
              @click="showMenu = true"
              round flat dense color="white" icon="keyboard_arrow_up"
              :style=`{
                position: 'absolute', zIndex: 3000,
                right: '12px', top: '-44px'
              }`)
</template>

<script>
import navMobile from './nav_mobile.vue'

import contentPlayer from 'components/content_player/index.vue'
import compositionPlayer from 'components/composition/composition_player/index.vue'
import compositionEditor from 'components/composition/composition_editor/index.vue'

import nameEditor from 'components/node_editor/name_editor.vue'
import spheresEditor from 'components/node_editor/spheres_editor.vue'
import categoryEditor from 'components/node_editor/category_editor.vue'

import pageNodes from './page_nodes/index.vue'

export default {
  name: 'explorerDefault',
  props: ['contentKalpa', 'query'],
  components: {
    navMobile,
    contentPlayer,
    compositionPlayer,
    compositionEditor,
    nameEditor,
    spheresEditor,
    categoryEditor,
    pageNodes,
  },
  data () {
    return {
      player: null,
      pageId: null,
      headerHeight: 65,
      showMenu: true,
      node: null,
      nodeNew: {
        name: '',
        layout: 'HORIZONTAL',
        items: [],
        vertices: [],
        spheres: [],
        category: 'FUN',
      }
      // composition: null
    }
  },
  computed: {
    heightSquare () {
      if (this.$q.screen.width > this.$store.state.ui.pageWidth) {
        return this.$store.state.ui.pageWidth
      }
      else {
        return this.$q.screen.width
      }
    },
    heightPage () {
      return this.$q.screen.height - this.heightSquare
    }
  },
  watch: {
    // pageId: {
    //   handler (to, from) {
    //     if (to) {
    //       this.headerHeight = this.$q.screen.height * 0.66
    //     }
    //   }
    // }
  },
  methods: {
    onResize (e) {
      this.$log('onResize', e)
      this.width = e.width
      this.height = e.height
      if (this.$q.platform.is.mobile) {
        if (this.width > this.height) {
          // alert('HORIZONTAL')
        }
        if (this.width < this.height) {
          // alert('VERTICAL')
        }
      }
    },
    essenceCreateStart () {
      this.$log('essenceCreateStart')
      // go to square/essence height
      this.$tween.to(this, 0.3, {
        headerHeight: this.$q.screen.height - this.heightSquare
      })
      // create composition...
      let start = this.player.currentTime
      let end = start + 30 > this.player.duration ? this.player.duration : start + 30
      let composition = {
        id: Date.now().toString(),
        thumbUrl: this.contentKalpa.thumbUrl,
        thumbHeight: this.contentKalpa.thumbHeight,
        thumbWidth: this.contentKalpa.thumbWidth,
        outputType: 'VIDEO',
        layers: [
          {id: Date.now().toString(), contentOid: this.contentKalpa.oid, figuresAbsolute: [{t: start, points: []}, {t: end, points: []}]},
        ],
        operation: { items: null, operations: null, type: 'CONCAT'},
        __typename: 'Composition',
      }
      let node = JSON.parse(JSON.stringify(this.nodeNew))
      node.items[0] = composition
      this.node = node
    },
    pageIdChanged (pageId) {
      if (this.pageId === pageId) {
        this.pageId = null
        this.$tween.to(this, 0.3, {
          // headerHeight: this.$q.screen.height - this.heightSquare
          headerHeight: 65
        })
      }
      else {
        this.pageId = pageId
        this.$tween.to(this, 0.3, {
          // headerHeight: this.$q.screen.height - this.heightSquare
          headerHeight: this.heightPage
        })
      }
    },
  },
  mounted () {
    this.$log('mounted')
    document.body.style.background = 'black !important'
    // window.addEventListener('orientationchange', async (event) => {
    //   // console.log("the orientation of the device is now " + event.target.screen.orientation.angle)
    //   alert('OOO: ' + event.target.screen.orientation.angle)
    //   await this.$wait(2000)
    //   this.$q.notify({type: 'negative', position: 'top', message: event.target.screen.orientation.angle})
    // })
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
