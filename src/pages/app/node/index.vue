<template lang="pug">
kalpa-layout()
  template(v-slot:footer)
    nav-mobile(
      v-if="$q.screen.lt.md"
      :pageId="pageId"
      @pageId="pageIdChange")
  template(v-slot:body)
    .row.full-width.items-start.content-start
      //- header
      .row.full-width.justify-center.b-30.q-pa-sm
        div(
          :style=`{
            maxWidth: $store.state.ui.pageWidth+'px',
            borderRadius: '10px',
          }`).row.full-width.items-center.content-center.q-pa-sm.b-40
          q-icon(name="adjust" color="white" size="30px").q-ml-sm
          .col
          h1.text-white.text-bold {{$t('Node')}}
          .col
          //- tutorial
          q-btn(
            @click="$store.commit('ui/stateSet', ['kalpaWelcome', {id: 'node_first', useIntro: false, useProfileEditor: false}])"
            round flat color="white" icon="fas fa-info")
      //- body
      div(
        v-if="node"
        :style=`{
          //- paddingTop: '8px',
          paddingBottom: '200px',
        }`).row.full-width.justify-center.b-30
          div(
            v-if="node"
            :style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width.q-pb-xs
            //- node wrapper
            div(
              v-observe-visibility=`{
                throttle: 150,
                callback: nodeVisibilityCallback,
                intersection: {
                  //- root: scrollTargetIsWindow ? null : scrollTarget,
                  //- rootMargin: '-50% 0px'
                }
              }`
              ).row.full-width
              item-feed(
                :item="node"
                :isActive="nodeIsVisible"
                :isVisible="nodeIsVisible")
            .row.full-width.q-pt-lg.q-px-xs
              ////- tabs sticky
              //div(
              //  :style=`{
              //    position: 'sticky', top: '0px', zIndex: 1000,
              //  }`).row.full-width.q-px-md.b-30
              //  q-tabs(
              //    v-model="pageId"
              //    switch-indicator no-caps dense
              //    active-color="green"
              //  ).full-width.text-grey-8
              //    q-tab(
              //      v-for="(p,pi) in pages" :key="p.id"
              //      :name="p.id" :label="p.name")
              ////- tab panels
              //q-tab-panels(
              //  v-model="pageId"
              //  :swipeable="$q.platform.is.mobile"
              //  :animated="$q.platform.is.mobile"
              //  :style=`{}`).full-width.b-30
              //  q-tab-panel(
              //    v-for="(p,pi) in pages" :key="p.id" :name="p.id"
              //    :style=`{
              //      background: 'none',
              //      minHeight: '70vh',
              //    }`
              //  ).row.full-width.items-start.content-start.justify-center.q-pa-sm
              //    component(
              //      :is="'page-' + pageId"
              //      :node="node"
              //      :height="700"
              //    )
              //    //page-joints(:node="node")
              //    //page-comments(:node="node")
              //    //- widget-joints(:node="node")
              page-comments(
                :node="node"
                :height="700"
              )
              //page-joints(
              //  :node="node"
              //  :height="700"
              //)
              page-recommendations(
                :node="node"
              )
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import navMobile from './nav_mobile.vue'
import widgetJoints from './widget_joints/index.vue'
import pageJoints from './page_joints/index.vue'
import pageRecommendations from './page_recommendations/index.vue'
import pageComments from './page_comments/index.vue'

export default {
  name: 'pageApp_node',
  components: {
    navMobile,
    widgetJoints,
    pageJoints,
    pageComments,
    pageRecommendations,
  },
  data () {
    return {
      node: null,
      nodeIsVisible: true,
      pageId: 'graph',
      pages: [{id: 'graph', name: this.$t('Graph')}, {id: 'joints', name: this.$t('Joints')}, {id: 'comments', name: this.$t('Comments')}]
    }
  },
  computed: {
  },
  watch: {
    '$route.params.oid': {
      deep: true,
      immediate: true,
      async handler (to, from) {
        if (to) {
          // this.$log('$route.params.oid TO', to)
          this.node = await this.$rxdb.get(RxCollectionEnum.OBJ, to)
        }
      }
    },
    pageId: {
      // immediate: true,
      handler (to, from) {
        if (this.$route.query.pageId !== to) this.$router.replace({ path: this.$route.path, query: {...this.$route.query, pageId: to }})
      }
    },
    '$route.query.pageId': {
      immediate: true,
      handler (to, from) {
        this.pageId = to || this.pageId
      }
    }
  },
  methods: {
    nodeVisibilityCallback (isVisible, entry) {
      this.$log('nodeVisibilityCallback', isVisible)
      this.nodeIsVisible = isVisible
    }
  },
  async mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
