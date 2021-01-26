<template lang="pug">
q-layout(
  view="hHh Lpr lff").bg-black
  //- q-resize-observer(@resize="onResize" :debounce="300")
  //- header: content player
  q-header(:style=`{opacity: 1,}`).bg-black
    .row.full-width.justify-center
      div(
        :style=`{
          position: 'relative',
          height: 'calc('+ contentHeight +'px - env(safe-area-inset-top))',
          maxWidth: contentWidth+'px',
          //- maxWidth: $store.state.ui.pageWidth+'px',
          borderRadius: '0 0 10px 10px',
        }`
        ).column.full-width.bg-black
        div(:style=`{position: 'relative',}`).col
          content-player(
            @player="player = $event"
            :contentKalpa="contentKalpa"
            :style=`{
              height: '100%',
            }`
            :options=`{
              showHeader: false,
              showBar: true,
              showFooter: true,
            }`
            :styles=`{
              height: '100%',
              objectFit: 'contain',
            }`
            ).full-width.bg-black
        //- .row.full-width.q-py-sm
  //- footer: navigation
  q-footer(reveal)
    div(
      :style=`{
        paddingBottom: 'env(safe-area-inset-bottom)',
      }`
      ).row.full-width.justify-center
      div(
        :style=`{
          borderRadius: '10px 10px 0 0',
          maxWidth: $store.state.ui.pageWidth+'px',
        }`
        ).row.full-width.b-40
        nav-mobile(
          v-if="player && !player.figure"
          @pageId="pageIdChange"
          :pageId="pageId"
          :style=`{
            zIndex: 1000,
          }`)
        //- v-touch-pan.prevent.mouse="footerHeight === footerHeightMax ? null : footerOnPan"
        div(
          v-if="player && player.figure"
          :style=`{
            minHeight: '70px',
            height: footerHeight+'px',
          }`
          ).column.full-width
          div(
            :style=`{
              position: 'relative',
              minHeight: '70px',
            }`
            ).row.full-width.items-center.content-center.q-px-sm
            //- div(
              @click="footerHeaderClick"
              v-if="footerHeight === 70"
              :style=`{position: 'absolute', zIndex: 1000,}`
              ).row.fit.br
            q-btn(round flat icon="play_arrow")
            .col.full-height
              div(:style=`{textAlign: 'center'}`).row.fit.items-center.content-center.justify-center.q-px-sm
                //- span.text-white в чем суть в чем суть в чем суть
                q-input(
                  v-model="node.name"
                  borderless dark
                  type="textarea" autogrow :rows="1"
                  placeholder="В чем суть?"
                  :input-style=`{
                    fontSize: '20px',
                    textAlign: 'center',
                    lineHeight: 1.2,
                  }`
                  ).full-width
            q-btn(
              @click="footerHeaderClick"
              round flat
              :icon="footerHeight === 70 ? 'keyboard_arrow_up' : 'keyboard_arrow_down'")
          .col.full-width.scroll
            .row.full-width.q-pa-sm
              div(v-for="n in 10" :key="n" :style=`{}`).row.full-width.q-pa-md.q-mb-sm.b-40 {{ n }}
            .row.full-width.q-pt-sm.q-pb-xl.q-px-xl
              q-btn(
                @click="nodePublish()"
                color="green" no-caps
                :style=`{
                  height: '50px',
                }`).full-width.q-mb-sm
                span.text-bold Опубликовать
              q-btn(outline color="green" no-caps @click="nodeSave()").full-width.q-mb-md Сохранить в черновики
              q-btn(outline color="red" no-caps @click="nodeDelete()").full-width Удалить
  //- pages or node creator...
  q-page-container
    q-page(
      :style=`{
      }`).row.full-width.justify-center
      div(
        v-if="contentKalpa && player"
        :style=`{
          position: 'relative',
          maxWidth: $store.state.ui.pageWidth+'px',
          borderRadius: '10px 10px 0 0',
        }`
        ).row.full-width.items-start.content-start.b-30
        component(
          :is="`page-${pageId}`"
          :node="node"
          :contentKalpa="contentKalpa"
          :player="player"
          :query="query"
          :height="$q.screen.height-contentHeight-70")
        //- div(
          v-if="player && player.figure"
          ).row.full-width
          div(
            :style=`{
              position: 'relative',
              minHeight: '70px',
            }`
            ).row.full-width.items-center.content-center.q-px-sm
            //- div(
              @click="footerHeaderClick"
              v-if="footerHeight === 70"
              :style=`{position: 'absolute', zIndex: 1000,}`
              ).row.fit.br
            q-btn(round flat color="white" icon="play_arrow")
            .col.full-height.bg
              div(:style=`{textAlign: 'center'}`).row.fit.items-center.content-center.justify-center.q-px-sm
                //- span.text-white в чем суть в чем суть в чем суть
                q-input(
                  v-model="node.name"
                  borderless dark
                  type="textarea" autogrow :rows="1"
                  placeholder="В чем суть ?"
                  :input-style=`{
                    fontSize: '20px',
                    textAlign: 'center',
                    lineHeight: 1.2,
                  }`
                  ).full-width.br
            q-btn(
              @click="contentHeight === contentHeightMax ? contentHeight = contentHeightMin : contentHeight = contentHeightMax"
              round flat color="white"
              :icon="contentHeight === contentHeightMax ? 'keyboard_arrow_up' : 'keyboard_arrow_down'")
          .row.full-width.justify-center.q-pt-sm.q-pb-xl.q-px-xl
            div(
              :style=`{
                maxWidth: '400px',
              }`
              ).row.full-width
              q-btn(
                @click="nodePublish()"
                color="green" no-caps
                :style=`{
                  height: '50px',
                }`).full-width.q-mb-sm
                span.text-bold Опубликовать
              q-btn(outline color="green" no-caps @click="nodeSave()").full-width.q-mb-md Сохранить в черновики
              q-btn(outline color="red" no-caps @click="nodeDelete()").full-width Удалить
</template>

<script>
import navMobile from '../nav_mobile.vue'
import contentPlayer from 'components/content_player/index.vue'

import pageNodes from '../page_nodes/index.vue'
import pageDrafts from '../page_drafts/index.vue'
import pageDetails from '../page_details/index.vue'
import pageCreator from '../page_creator/index.vue'
import pageNode from '../page_node/index.vue'

export default {
  name: 'layoutPopup',
  props: ['contentKalpa', 'query'],
  components: {
    navMobile,
    contentPlayer,
    pageNodes,
    pageDrafts,
    pageDetails,
    pageCreator,
    pageNode,
  },
  data () {
    return {
      player: null,
      contentHeight: 0,
      contentWidth: 0,
      footerHeight: 70,
      pageId: null,
      node: {
        name: '',
        spheres: []
      }
    }
  },
  computed: {
    contentHeightMin () {
      return this.$q.screen.height / 3
    },
    contentHeightMax () {
      return this.$q.screen.height - 70
    },
    contentWidthMin () {
      return Math.min(this.$q.screen.width, 700)
    },
    contentWidthMax () {
      return this.$q.screen.width
    },
    footerHeightMax () {
      return this.$q.screen.height * 0.66
    },
    footerHeightMin () {
      return 70
    }
  },
  watch: {
    pageId: {
      immediate: true,
      handler (to, from) {
        if (to) {
          this.$tween.to(this, 0.3, {
            contentHeight: this.contentHeightMin,
            contentWidth: this.contentWidthMax,
          })
        }
        else {
          this.$tween.to(this, 0.3, {
            contentHeight: this.contentHeightMax,
            contentWidth: this.contentWidthMax
          })
        }
      }
    }
  },
  methods: {
    footerOnPan (e) {
      // this.$log('footerOnPan', e.delta.y)
      let footerHeight = this.footerHeight - e.delta.y
      if (footerHeight > this.footerHeightMax) footerHeight = this.footerHeightMax
      this.$log('footerOnPan footerHeight', footerHeight)
      this.footerHeight = footerHeight
      if (e.isFinal) {
        if (this.footerHeight > this.footerHeightMax / 2) {
          this.footerHeight = this.footerHeightMax
        }
        else {
          this.footerHeight = this.footerHeightMin
        }
      }
    },
    footerHeaderClick (e) {
      this.$log('footerHeaderClick', e)
      let footerHeight = this.footerHeight === 70 ? this.footerHeightMax : this.footerHeightMin
      // let contentHeight = this.footerHeight === 70 ? this.contentHeightMin : this.contentHeightMax
      let contentHeight = () => {
        if (this.footerHeight === 70) {
          // return this.$q.screen.height - this.footerHeightMax + 100
          return this.$q.screen.height - this.footerHeightMax
        }
        else {
          return this.contentHeightMax
        }
      }
      this.$tween.to(this, 0.25, {
        footerHeight: footerHeight,
        contentHeight: contentHeight(),
        onComplete: () => {
          this.$log('footerHeaderClick DONE')
        }
      })
    },
    pageIdChange (pageId) {
      this.$log('pageIdChange', pageId)
      if (this.pageId === pageId) {
        this.pageId = null
      }
      else {
        this.pageId = pageId
      }
    },
    nodeDelete () {
      this.$log('nodeDelete')
      this.player.setState('figure', null)
      this.$tween.to(this, 0.3, {
        contentHeight: this.contentHeightMax,
        contentWidth: this.contentWidthMax
      })
    }
  }
}
</script>
