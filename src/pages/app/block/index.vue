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
          q-icon(name="hub" color="white" size="30px").q-ml-sm
          .col
          h1.text-white.text-bold {{$t('Essence block')}}
          .col
          //- tutorial
          //q-btn(
          //  @click="$store.commit('ui/stateSet', ['kalpaWelcome', {id: 'node_first', useIntro: false, useProfileEditor: false}])"
          //  round flat color="white" icon="fas fa-info")
          q-btn(
            @click=""
            round flat color="white" icon="fas fa-info")
      //- body
      div(
        v-if="block"
        :style=`{
          //- paddingTop: '8px',
          paddingBottom: '200px',
        }`).row.full-width.justify-center.b-30
          div(
            v-if="block"
            :style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width.q-pb-xs
            //- block wrapper
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
                :itemShortOrFull="block"
                :isActive="nodeIsVisible"
                :isVisible="nodeIsVisible")
            .row.full-width.q-pt-lg.q-px-xs
              q-list(bordered).row.full-width
                q-expansion-item(v-model="commentsOpened"  group="somegroup" icon="chat" :label="$t('Comments')" dark).col-12
                  // template(v-slot:header)
                    // todo самый лучший коммент
                  row.full-width
                    page-comments(v-if="commentsOpened" :node="block")
                q-separator
                q-expansion-item(v-model="similarOpened" group="somegroup" icon="grid_view" :label="$t('Similar')" dark default-opened=false).col-12
                  page-similar(v-if="similarOpened" :node="block")
                q-separator
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import navMobile from 'src/pages/app/node/nav_mobile.vue'
import pageComments from '../node/page_comments';
import pageSimilar from '../node/page_similar';

export default {
  name: 'pageApp_node',
  components: {
    navMobile,
    pageComments,
    pageSimilar,
  },
  data () {
    return {
      block: null,
      nodeIsVisible: true,
      pageId: 'graph',
      pages: [{id: 'graph', name: this.$t('Graph')}, {id: 'joints', name: this.$t('Joints')}, {id: 'comments', name: this.$t('Comments')}],
      similarOpened: false,
      commentsOpened: false
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
          this.block = await this.$rxdb.get(RxCollectionEnum.OBJ, to)
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
